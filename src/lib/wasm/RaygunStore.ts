import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { Store } from "../state/Store"
import { UIStore } from "../state/ui"
import { ConversationStore } from "../state/conversation"
import { GroupPermissions, MessageOptions } from "warp-wasm"
import { ChatType, MessageAttachmentKind, Route } from "$lib/enums"
import { type User, type Chat, defaultChat, type Message, mentions_user, type Attachment } from "$lib/types"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import { create_cancellable_handler, type Cancellable } from "$lib/utils/CancellablePromise"
import { parseJSValue } from "./EnumParser"
import { MultipassStoreInstance } from "./MultipassStore"
import { log } from "$lib/utils/Logger"
import { imageFromData } from "./ConstellationStore"
import { Sounds } from "$lib/components/utils/SoundHandler"
import { SettingsStore } from "$lib/state"
import { ToastMessage } from "$lib/state/ui/toast"
import { page } from "$app/stores"
import { goto } from "$app/navigation"

const MAX_PINNED_MESSAGES = 100
export type FetchMessagesConfig =
    | {
          type: "MostRecent"
          amount: number
      }
    // fetch messages which occur earlier in time
    | {
          type: "Earlier"
          start_date: Date
          limit: number
      }
    // fetch messages which occur later in time
    | {
          type: "Later"
          start_date: Date
          limit: number
      }
    // fetch messages between given time
    | {
          type: "Between"
          from: Date
          to: Date
      }
    // fetch half_size messages before and after center.
    | {
          type: "Window"
          start_date: Date
          half_size: number
      }

export type FetchMessageResponse = {
    messages: Message[]
    has_more: boolean
    most_recent: string | undefined
}

export type SendMessageResult = {
    message: string
    progress?: wasm.AsyncIterator
}

export type MultiSendMessageResult = {
    chat: string
    result: SendMessageResult
}

export type ConversationSettings =
    | {
          direct: {}
      }
    | {
          group: {
              members_can_add_participants: boolean
              members_can_change_name: boolean
              members_can_change_photo: boolean
          }
      }

export type FileAttachment = {
    file: string
    attachment?: [ReadableStream, number]
}

type Range = {
    start: any
    end: any
}

class RaygunStore {
    private raygunWritable: Writable<wasm.RayGunBox | null>
    // A map of message listeners
    private messageListeners: Writable<{ [key: string]: Cancellable }>

    constructor(raygun: Writable<wasm.RayGunBox | null>) {
        this.raygunWritable = raygun
        this.messageListeners = writable({})
        this.raygunWritable.subscribe(async r => {
            if (r) {
                let listeners = get(this.messageListeners)
                if (Object.keys(listeners).length > 0) {
                    // Cancels current message event listeners
                    for (let handler of Object.values(listeners)) {
                        handler.cancel()
                    }
                }
                await this.initConversationHandlers(r)
                // handleRaygunEvent must be called after initConversationHandlers
                // this is because if 'raygun.raygun_subscribe' is called before 'raygun.list_conversations', it causes 'raygun.list_conversations' to hang. (reason currently unknown)
                this.handleRaygunEvent(r)
            }
        })
    }

    async createConversation(recipient: User) {
        return await this.get(async r => this.convertWarpConversation(await r.create_conversation(recipient.key), r), "Error creating new conversation")
    }

    async createGroupConversation(name: string | undefined, recipients: User[]) {
        const permissions = new wasm.GroupPermissions()
        let user = get(Store.state.user)
        permissions.set_permissions(user.key, [wasm.GroupPermission.AddParticipants, wasm.GroupPermission.SetGroupName])
        return await this.get(
            async r =>
                this.convertWarpConversation(
                    await r.create_group_conversation(
                        name,
                        recipients.map(r => r.key),
                        permissions
                    ),
                    r
                ),
            "Error creating new group conversation"
        )
    }

    async addGroupParticipants(conversation_id: string, recipients: string[]) {
        return await this.get(r => {
            for (let recipient of recipients) {
                r.add_recipient(conversation_id, recipient)
            }
            return conversation_id
        }, "Error adding participants")
    }

    async removeGroupParticipants(conversation_id: string, recipients: string[]) {
        return await this.get(r => {
            for (let recipient of recipients) {
                r.remove_recipient(conversation_id, recipient)
            }
            return conversation_id
        }, "Error removing participants")
    }

    async updateConversationName(conversation_id: string, name: string) {
        return await this.get(r => {
            r.update_conversation_name(conversation_id, name)
            return conversation_id
        }, "Error updating conversation name")
    }

    async updateConversationPermissions(conversation_id: string, permissions: []) {
        let groupPermissions = new wasm.GroupPermissions()
        let permissionsLog = groupPermissions.get_permissions(conversation_id)
        console.log("Permissions: ", permissionsLog)
        groupPermissions.set_permissions(conversation_id, [])
        return await this.get(r => r.update_conversation_permissions(conversation_id, groupPermissions), "Error updating conversation settings")
    }

    /**
     * Deletes a message for the given chat. If no message id provided will delete the chat
     */
    async delete(conversation_id: string, message_id?: string) {
        return await this.get(r => r.delete(conversation_id, message_id), "Error deleting message")
    }

    /**
     * Deletes direct messages with the given recipient. E.g. when blocking a user
     */
    async deleteAllConversationsFor(recipient: string) {
        return this.get(async r => {
            let convs = await r.list_conversations()
            convs
                .convs()
                .filter(c => parseJSValue(c.permissions()).type === "direct" && recipient in c.recipients())
                .forEach(async conv => {
                    await this.get(r => r.delete(conv.id(), undefined), "Error deleting message")
                })
        }, "Error deleting conversations for " + recipient)
    }

    async getConversation(conversation_id: string) {
        return this.get(async r => this.convertWarpConversation(await r.get_conversation(conversation_id), r), `Error fetching conversation with id ${conversation_id}`)
    }

    async listConversations(): Promise<Result<WarpError, Chat[]>> {
        return this.get(async r => {
            let convs = await r.list_conversations()
            return await Promise.all(convs.convs().map(c => this.convertWarpConversation(c, r)))
        }, `Error fetching conversations`)
    }

    async fetchMessages(conversation_id: string, config: FetchMessagesConfig & { [type: string]: any }): Promise<Result<WarpError, FetchMessageResponse>> {
        return this.get(async r => {
            let message_options = new MessageOptions()
            switch (config.type) {
                case "Between": {
                    let range: Range = {
                        start: config.from,
                        end: config.to,
                    }
                    message_options.set_date_range(range) //TODO verify that js Date can be parsed to rust DateTime::<Utc>
                }
                case "MostRecent": {
                    let total_messages = await r.get_message_count(conversation_id)
                    let range: Range = {
                        start: Math.min(0, total_messages - config.amount),
                        end: total_messages,
                    }
                    message_options.set_range(range)
                }
                case "Earlier": {
                    let range: Range = {
                        start: new Date(),
                        end: config.start_date,
                    }
                    message_options.set_date_range(range)
                    message_options.set_reverse()
                    message_options.set_limit(config.limit)
                }
                case "Later": {
                    let range: Range = {
                        start: config.start_date,
                        end: new Date(),
                    }
                    message_options.set_date_range(range)
                    message_options.set_limit(config.limit)
                }
            }

            let messages = await this.getMessages(r, conversation_id, message_options)
            if (config.type === "Earlier") {
                messages = messages.reverse()
            }
            let has_more = messages.length >= config.get_limit()

            let opt = new MessageOptions()
            opt.set_limit(1)
            opt.set_last_message()
            let most_recent = await this.getMessages(r, conversation_id, opt)
            return {
                messages: messages,
                has_more: has_more,
                most_recent: most_recent[most_recent.length].id,
            }
        }, "Error fetching messages")
    }

    async fetchPinnedMessages(conversation_id: string) {
        return this.get(async r => {
            let options = new MessageOptions()
            options.set_reverse()
            options.set_limit(MAX_PINNED_MESSAGES)
            options.set_pinned()
            let messages = await this.getMessages(r, conversation_id, options)
            return messages
        }, "Error fetching pinned messages")
    }

    async send(conversation_id: string, message: string[], attachments?: FileAttachment[]): Promise<Result<WarpError, SendMessageResult>> {
        return await this.get(async r => {
            return await this.sendTo(r, conversation_id, message, attachments)
        }, "Error sending message")
    }

    async sendMultiple(conversation_ids: string[], message: string[], attachments?: FileAttachment[]): Promise<Result<WarpError, MultiSendMessageResult[]>> {
        return await this.get(async r => {
            let sent = []
            for (let conversation_id of conversation_ids) {
                let res: MultiSendMessageResult = { chat: conversation_id, result: await this.sendTo(r, conversation_id, message, attachments) }
                sent.push(res)
            }
            return sent
        }, "Error sending message")
    }

    private async sendTo(raygun: wasm.RayGunBox, conversation_id: string, message: string[], attachments?: FileAttachment[]): Promise<SendMessageResult> {
        if (attachments && attachments.length > 0) {
            let result = await raygun
                .attach(
                    conversation_id,
                    undefined,
                    attachments.map(f => new wasm.AttachmentFile(f.file, f.attachment ? new wasm.AttachmentStream(f.attachment[1], f.attachment[0]) : undefined)),
                    message
                )
                .then(res => {
                    // message_sent event gets fired AFTER this returns
                    ConversationStore.addPendingMessages(conversation_id, res.get_message_id(), message)
                    this.createFileAttachHandler(conversation_id, res)
                    return res
                })
            return {
                message: result.get_message_id(),
                progress: result,
            }
        }
        return {
            message: await raygun.send(conversation_id, message).then(messageId => {
                // message_sent event gets fired BEFORE this returns
                // So to
                // 1. unify this system
                // 2. keep it roughly the same as native (as on native due to some channel delays it handles message_sent after #send returns)
                // We add the pending msg here and remove it in message_sent which has a short delay
                ConversationStore.addPendingMessages(conversation_id, messageId, message)
                return messageId
            }),
        }
    }

    async edit(conversation_id: string, message_id: string, message: string[]) {
        return await this.get(r => r.edit(conversation_id, message_id, message), "Error editing message")
    }

    async downloadAttachment(conversation_id: string, message_id: string, file: string, size?: number) {
        return await this.get(async r => {
            let result = await r.download_stream(conversation_id, message_id, file)
            return this.createFileDownloadHandler(file, result, size)
        }, `Error downloading attachment from ${conversation_id} for message ${message_id}`)
    }

    async react(conversation_id: string, message_id: string, state: wasm.ReactionState, emoji: string) {
        let result = await this.get(r => r.react(conversation_id, message_id, state, emoji), "Error reacting to message")
        return result.map(_ => {
            ConversationStore.editReaction(get(Store.state.activeChat).id, message_id, emoji, state == wasm.ReactionState.Add)
        })
    }

    async pin(conversation_id: string, message_id: string, pin: boolean) {
        return await this.get(r => r.pin(conversation_id, message_id, pin ? wasm.PinState.Pin : wasm.PinState.Unpin), "Error pinning message")
    }

    async reply(conversation_id: string, message_id: string, message: string[], attachments?: FileAttachment[]): Promise<Result<WarpError, SendMessageResult>> {
        return await this.get(async r => {
            if (attachments && attachments.length > 0) {
                let result = await r.attach(
                    conversation_id,
                    message_id,
                    attachments.map(f => new wasm.AttachmentFile(f.file, f.attachment ? new wasm.AttachmentStream(f.attachment[1], f.attachment[0]) : undefined)),
                    message
                )
                return {
                    message: result.get_message_id(),
                    progress: result,
                }
            }
            return {
                message: await r.reply(conversation_id, message_id, message),
            }
        }, "Error replying to message")
    }

    async sendEvent(conversation_id: string, event: wasm.MessageEvent) {
        return await this.get(r => r.send_event(conversation_id, event), `Error sending event ${event}`)
    }

    private async handleRaygunEvent(raygun: wasm.RayGunBox) {
        let events: wasm.AsyncIterator | undefined
        while (!events) {
            // Have a buffer that aborts and retries in case #raygun_subscribe hangs
            events = await Promise.race([
                raygun.raygun_subscribe(),
                new Promise<undefined>(f => {
                    setTimeout(f, 100)
                    return undefined
                }),
            ])
        }
        let listener = {
            [Symbol.asyncIterator]() {
                return events
            },
        }
        log.info("Listening raygun events!")
        for await (const value of listener) {
            let event = parseJSValue(value)
            log.info(`Handling conversation event: ${JSON.stringify(event)}`)
            log.info(`Event Type ${event.type}`)

            switch (event.type) {
                case "conversation_created": {
                    let conversationId: string = event.values["conversation_id"]
                    let conv = await raygun.get_conversation(conversationId)
                    let chat = await this.convertWarpConversation(conv, raygun)
                    let listeners = get(this.messageListeners)
                    let handler = await this.createConversationEventHandler(raygun, conversationId)
                    listeners[conversationId] = handler
                    this.messageListeners.set(listeners)

                    UIStore.addSidebarChat(chat)
                    break
                }
                case "conversation_deleted": {
                    let conversationId: string = event.values["conversation_id"]
                    // Stop message listeners
                    let listeners = get(this.messageListeners)
                    if (conversationId in listeners) {
                        listeners[conversationId].cancel()
                        delete listeners[conversationId]
                        this.messageListeners.set(listeners)
                    }

                    // Update stores
                    UIStore.removeSidebarChat(conversationId)
                    Store.state.favorites.update(favoriteChats => {
                        return favoriteChats.filter(c => !c.id.includes(conversationId))
                    })
                    ConversationStore.removeConversation(conversationId)
                    if (get(Store.state.activeChat).id === conversationId) {
                        Store.clearActiveChat()
                    }
                    break
                }
            }
        }
    }

    private async initConversationHandlers(raygun: wasm.RayGunBox) {
        let conversations: wasm.ConversationList | undefined
        while (!conversations) {
            // It seems it takes a while for raygun to be ready so we retry till this succeeds
            try {
                conversations = await Promise.race([
                    raygun.list_conversations(),
                    new Promise<undefined>(f => {
                        setTimeout(f, 100)
                        return undefined
                    }),
                ])
            } catch (e) {
                if (!`${e}`.includes("RayGun extension is unavailable")) throw e
                await new Promise(f => setTimeout(f, 100))
            }
        }
        let handlers: { [key: string]: Cancellable } = {}
        for (let conversation of conversations.convs()) {
            let handler = await this.createConversationEventHandler(raygun, conversation.id())
            handlers[conversation.id()] = handler
        }
        this.messageListeners.set(handlers)
    }

    private async createConversationEventHandler(raygun: wasm.RayGunBox, conversation_id: string) {
        let stream = await raygun.get_conversation_stream(conversation_id)
        return create_cancellable_handler(async isCancelled => {
            let listener = {
                [Symbol.asyncIterator]() {
                    return stream
                },
            }
            streamLoop: for await (const value of listener) {
                let event = parseJSValue(value)
                log.info(`Handling message event: ${JSON.stringify(event)}`)
                if (isCancelled()) {
                    log.debug(`Breaking stream loop not necessary anymore from: ${conversation_id}`)
                    break streamLoop
                }
                switch (event.type) {
                    case "message_sent": {
                        let conversation_id: string = event.values["conversation_id"]
                        let message_id: string = event.values["message_id"]
                        // Needs a delay because raygun does not contain the sent message yet
                        await new Promise(f => setTimeout(f, 10))
                        let message = await this.convertWarpMessage(conversation_id, await raygun.get_message(conversation_id, message_id))
                        ConversationStore.removePendingMessages(conversation_id, message_id)
                        if (message) {
                            ConversationStore.addMessage(conversation_id, message)
                            // TODO move chat to top
                        }
                        break
                    }
                    case "message_received": {
                        let conversation_id: string = event.values["conversation_id"]
                        let message_id: string = event.values["message_id"]
                        let message = await this.convertWarpMessage(conversation_id, await raygun.get_message(conversation_id, message_id))
                        if (message) {
                            let ping = mentions_user(message, get(Store.state.user).key)
                            ConversationStore.addMessage(conversation_id, message)
                            let settings = get(SettingsStore.state)
                            let sender = get(Store.getUser(message.details.origin))
                            let activeChat = get(Store.state.activeChat)
                            let chat = get(UIStore.state.chats).find(c => c.id === conversation_id)
                            let messageToSend: string = ""
                            if (chat) {
                                if (!chat.unread) {
                                    messageToSend = `${sender.name} sent you a message`
                                } else if (chat.unread > 1) {
                                    messageToSend = `${sender.name} sent you ${chat.unread} new messages`
                                }
                            }
                            let notify = (settings.notifications.messages && get(page).route.id !== Route.Chat) || (settings.notifications.messages && get(page).route.id === Route.Chat && activeChat.id !== conversation_id)
                            if (ping || notify) {
                                Store.addToastNotification(
                                    new ToastMessage("New Message", messageToSend, 2, undefined, undefined, () => {
                                        let chat = get(UIStore.state.chats).find(c => c.id === conversation_id)
                                        if (chat) {
                                            Store.setActiveChat(chat)
                                            goto(Route.Chat)
                                        }
                                    }),
                                    settings.audio.messageSounds ? Sounds.Notification : undefined
                                )
                            }
                            //TODO move chat to top
                            //TODO handle ping
                        }
                        break
                    }
                    case "message_edited": {
                        let conversation_id: string = event.values["conversation_id"]
                        let message_id: string = event.values["message_id"]
                        let message = await this.convertWarpMessage(conversation_id, await raygun.get_message(conversation_id, message_id))
                        if (message) {
                            ConversationStore.editMessage(conversation_id, message_id, message.text.join("\n"), message)
                        }
                        break
                    }
                    case "message_deleted": {
                        let conversation_id: string = event.values["conversation_id"]
                        let message_id: string = event.values["message_id"]
                        ConversationStore.removeMessage(conversation_id, message_id)
                        break
                    }
                    case "message_pinned": {
                        let conversation_id: string = event.values["conversation_id"]
                        ConversationStore.pinMessage(conversation_id, event.values["message_id"], true)
                        break
                    }
                    case "message_unpinned": {
                        let conversation_id: string = event.values["conversation_id"]
                        ConversationStore.pinMessage(conversation_id, event.values["message_id"], false)
                        break
                    }
                    case "message_reaction_added": {
                        let conversation_id: string = event.values["conversation_id"]
                        ConversationStore.editReaction(conversation_id, event.values["message_id"], event.values["reaction"], true, event.values["did_key"])
                        break
                    }
                    case "message_reaction_removed": {
                        let conversation_id: string = event.values["conversation_id"]
                        ConversationStore.editReaction(conversation_id, event.values["message_id"], event.values["reaction"], false, event.values["did_key"])
                        break
                    }
                    case "conversation_name_updated": {
                        let conversation_id: string = event.values["conversation_id"]
                        let name = event.values["name"]
                        UIStore.mutateChat(conversation_id, c => {
                            c.name = name
                        })
                        break
                    }
                    case "recipient_added": {
                        let conversation_id: string = event.values["conversation_id"]
                        let recipient = await MultipassStoreInstance.identity_from_did(event.values["recipient"])
                        if (recipient) {
                            UIStore.mutateChat(conversation_id, c => {
                                c.users = [...c.users, recipient.key]
                            })
                            Store.updateUser(recipient)
                        }
                        break
                    }
                    case "recipient_removed": {
                        let conversation_id: string = event.values["conversation_id"]
                        let recipient = event.values["recipient"]
                        UIStore.mutateChat(conversation_id, c => {
                            c.users = c.users.filter(u => u !== recipient)
                        })
                        break
                    }
                    case "event_received": {
                        let conversation_id: string = event.values["conversation_id"]
                        let did_key = event.values["did_key"]
                        if (event.values["event"] === "typing") {
                            UIStore.mutateChat(conversation_id, c => {
                                c.typing_indicator.add(did_key)
                            })
                        }
                        break
                    }
                    case "event_cancelled": {
                        // Handle EventCancelled. Not needed atm
                        break
                    }
                    case "conversation_settings_updated": {
                        let conversation_id: string = event.values["conversation_id"]
                        let settings = event.values["settings"] as ConversationSettings
                        UIStore.mutateChat(conversation_id, c => {
                            c.kind = "direct" in settings ? ChatType.DirectMessage : ChatType.Group
                            if (c.kind === ChatType.Group) {
                                let groupSettings = settings as any
                                let group = groupSettings["group"]
                                c.settings.permissions.allowAnyoneToAddUsers = group["members_can_add_participants"] as boolean
                                c.settings.permissions.allowAnyoneToModifyName = group["members_can_change_name"] as boolean
                            }
                        })
                        break
                    }
                    default: {
                        log.error(`Unhandled message event: ${JSON.stringify(event)}`)
                        break
                    }
                }
            }
        })
    }

    private async getMessages(raygun: wasm.RayGunBox, conversation_id: string, options: MessageOptions) {
        let msgs = await raygun.get_messages(conversation_id, options)
        let messages: Message[] = []
        if (msgs.variant() === wasm.MessagesEnum.List) {
            let warpMsgs = (msgs.value() as any[]).map(v => wasm.message_from({ ...Object.fromEntries(v) }))
            messages = (await Promise.all(warpMsgs.map(async msg => await this.convertWarpMessage(conversation_id, msg)))).filter((m: Message | null): m is Message => m !== null)
        }
        return messages
    }

    private async createFileDownloadHandler(name: string, it: wasm.AsyncIterator, _size?: number) {
        let listener = {
            [Symbol.asyncIterator]() {
                return it
            },
        }
        let data: any[] = []
        try {
            for await (const value of listener) {
                data = [...data, ...value]
            }
        } catch (_) {}
        let blob = new Blob([new Uint8Array(data)])
        const elem = window.document.createElement("a")
        elem.href = window.URL.createObjectURL(blob)
        elem.download = name
        document.body.appendChild(elem)
        elem.click()
        document.body.removeChild(elem)
    }

    /**
     * Create a handler for attachment results that uploads the file to chat and updates pending message attachments
     * TODO: verify it works as we dont have a way to upload files yet
     */
    private async createFileAttachHandler(conversationId: string, upload: wasm.AttachmentResult) {
        let listener = {
            [Symbol.asyncIterator]() {
                return upload
            },
        }
        let cancelled = false
        try {
            for await (const value of listener) {
                let event = parseJSValue(value)
                log.info(`Handling file progress event: ${JSON.stringify(event)}`)
                switch (event.type) {
                    case "AttachedProgress": {
                        let locationKind = parseJSValue(event.values[0])
                        // Only streams need progress update
                        if (locationKind.type === "Stream") {
                            let progress = parseJSValue(event.values[1])
                            let file = progress.values["name"]
                            ConversationStore.updatePendingMessages(conversationId, upload.get_message_id(), file, current => {
                                if (current) {
                                    let copy = { ...current }
                                    switch (progress.type) {
                                        case "CurrentProgress": {
                                            copy.size = progress.values["current"]
                                            copy.total = progress.values["total"]
                                            break
                                        }
                                        case "ProgressComplete": {
                                            copy.size = progress.values["total"]
                                            copy.total = progress.values["total"]
                                            copy.done = true
                                            break
                                        }
                                        case "ProgressFailed": {
                                            copy.size = progress.values["last_size"]
                                            copy.error = `Error: ${progress.values["error"]}`
                                            break
                                        }
                                    }
                                    return copy
                                } else if (progress.type === "CurrentProgress") {
                                    return {
                                        name: file,
                                        size: progress.values["current"],
                                        total: progress.values["total"],
                                        cancellation: {
                                            cancel: () => {
                                                cancelled = true
                                            },
                                        },
                                    }
                                }
                                return undefined
                            })
                        }
                        break
                    }
                    case "Pending": {
                        if (Object.keys(event.values).length > 0) {
                            let res = parseJSValue(event.values)
                            if (res.type === "Err") {
                                log.error(`Error uploading file ${res.values}`)
                            }
                        }
                        break
                    }
                }
                if (cancelled) break
            }
        } catch (e) {
            if (!`${e}`.includes(`Error: returned None`)) throw e
        }
    }

    /**
     * Convenient helper method to get data from raygun
     */
    private async get<T>(handler: (raygun: wasm.RayGunBox) => Promise<T> | T, err: string): Promise<Result<WarpError, T>> {
        let raygun = get(this.raygunWritable)
        if (raygun) {
            try {
                return success(await handler(raygun))
            } catch (error) {
                return failure(handleErrors(`${err}: ${error}`))
            }
        }
        return failure(WarpError.RAYGUN_NOT_FOUND)
    }

    /**
     * Converts warp message to ui message
     */
    private async convertWarpMessage(conversation_id: string, message: wasm.Message | undefined): Promise<Message | null> {
        if (!message) return null
        let user = get(Store.state.user)
        let remote = message.sender() !== user.key
        if (remote) {
            let sender = await MultipassStoreInstance.identity_from_did(message.sender())
            if (sender) Store.updateUser(sender)
        }
        let attachments: any[] = message.attachments()
        return {
            id: message.id(),
            details: {
                at: message.date(),
                origin: message.sender(),
                remote: remote,
            },
            text: message.lines(),
            inReplyTo: message.replied() ? ConversationStore.getMessage(conversation_id, message.replied()!) : null,
            reactions: message.reactions(),
            attachments: attachments.map(f => this.convertWarpAttachment(f)),
            pinned: message.pinned(),
        }
    }

    private convertWarpAttachment(attachment: any): Attachment {
        let kind: MessageAttachmentKind = MessageAttachmentKind.File
        let type = parseJSValue(attachment.file_type)
        let mime = "application/octet-stream"
        if (type.type === "mime") {
            mime = type.values as any as string
        }
        if (mime.startsWith("image")) {
            kind = MessageAttachmentKind.Image
        } else if (mime.startsWith("video")) {
            kind = MessageAttachmentKind.Video
        }
        let thumbnail: [] = attachment.thumbnail
        let location = thumbnail.length > 0 ? imageFromData(attachment.thumbnail, "image", mime) : ""
        return {
            kind: kind,
            name: attachment.name,
            size: attachment.size,
            location: location,
        }
    }

    /**
     * Converts warp message to ui message
     */
    private async convertWarpConversation(chat: wasm.Conversation, raygun: wasm.RayGunBox): Promise<Chat> {
        let permissions = parseJSValue(chat.permissions())
        let direct = permissions.type === "direct"
        let msg = await this.getMessages(raygun, chat.id(), new MessageOptions())
        chat.recipients().forEach(async recipient => {
            let user = await MultipassStoreInstance.identity_from_did(recipient)
            if (user) {
                Store.updateUser(user)
            }
        })
        return {
            ...defaultChat,
            id: chat.id(),
            name: chat.name() ? chat.name()! : "",
            kind: direct ? ChatType.DirectMessage : ChatType.Group,
            settings: {
                displayOwnerBadge: true,
                readReceipts: true,
                permissions: {
                    allowAnyoneToAddUsers: !direct && (permissions.values["members_can_add_participants"] as boolean),
                    allowAnyoneToModifyPhoto: false,
                    allowAnyoneToModifyName: !direct && (permissions.values["members_can_change_name"] as boolean),
                },
            },
            creator: chat.creator(),
            users: chat.recipients(),
            last_message_at: msg.length > 0 ? msg[msg.length - 1].details.at : new Date(),
            last_message_preview: msg.length > 0 ? msg[msg.length - 1].text.join("\n") : "",
        }
    }
}

export const RaygunStoreInstance = new RaygunStore(WarpStore.warp.raygun)
