import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { Store } from "../state/Store"
import { UIStore } from "../state/ui"
import { ConversationStore } from "../state/conversation"
import { MessageOptions } from "warp-wasm"
import { Appearance, ChatType, MessageAttachmentKind, NotificationType, Route } from "$lib/enums"
import { type User, type Chat, defaultChat, type Message, mentions_user, type Attachment, messageTypeFromTexts, type Reaction, type FileProgress } from "$lib/types"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import { create_cancellable_handler, type Cancellable } from "$lib/utils/CancellablePromise"
import { parseJSValue } from "./EnumParser"
import { MultipassStoreInstance } from "./MultipassStore"
import { log } from "$lib/utils/Logger"
import { imageFromData, imageFromMime } from "./ConstellationStore"
import { Sounds } from "$lib/components/utils/SoundHandler"
import { SettingsStore } from "$lib/state"
import { ToastMessage } from "$lib/state/ui/toast"
import { page } from "$app/stores"
import { goto } from "$app/navigation"
import { isAndroidOriOS } from "$lib/utils/Mobile"
import { downloadFileFromWeb, shareFile } from "$lib/utils/Functions"

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
        return await this.get(
            async r =>
                this.convertWarpConversation(
                    await r.create_group_conversation(
                        name,
                        recipients.map(r => r.key),
                        new wasm.GroupPermissions()
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

    async setGroupPermissions(conversation_id: string, permissions: { [user: string]: wasm.GroupPermission[] }) {
        return await this.get(async r => {
            let groupPerm = new wasm.GroupPermissions()
            Object.entries(permissions).forEach(([user, perms]: [string, wasm.GroupPermission[]]) => {
                groupPerm.set_permissions(user, perms)
            })
            r.update_conversation_permissions(conversation_id, groupPerm)
            let chat = await r.get_conversation(conversation_id)
            let result: {
                [did: string]: GroupPermission[]
            } = {}
            chat.recipients().forEach(did => {
                permissions[did] = chat.permissions().get_permissions(did) || []
            })
            return result
        }, "Error updating conversation settings")
    }
    /**
     * Set the permission for given user
     * @returns The new permission set for the given user
     */
    async setPermissionFor(conversation_id: string, user: string, permission: wasm.GroupPermission, remove?: boolean) {
        return await this.get(async r => {
            let conv = await r.get_conversation(conversation_id)
            let groupPerm = conv.permissions()
            let permissions = groupPerm.get_permissions(user) || []
            if (remove) {
                if (permissions) {
                    permissions.splice(permissions.indexOf(permission), 1)
                }
            } else {
                if (!permissions.includes(permission)) {
                    permissions.push(permission)
                }
            }
            groupPerm.set_permissions(user, permissions)
            r.update_conversation_permissions(conversation_id, groupPerm)
            let result: wasm.GroupPermission[] = (await r.get_conversation(conversation_id)).permissions().get_permissions(user) || []
            return result
        }, "Error updating conversation settings")
    }

    async updateConversationDescription(conversation_id: string, description: string) {
        return await this.get(r => r.set_conversation_description(conversation_id, description), "Error updating conversation settings")
    }

    async updateConversationPicture(conversation_id: string, picture: string, banner?: boolean) {
        return await this.get(r => {
            const data = picture.startsWith("data:") ? picture.split(",")[1] : picture
            const buffer = Buffer.from(data, "base64")
            const len = buffer.length
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(buffer)
                    controller.close()
                },
            })
            let file = new wasm.AttachmentFile("", new wasm.AttachmentStream(len, stream))
            return banner ? r.update_conversation_banner(conversation_id, file) : r.update_conversation_icon(conversation_id, file)
        }, "Error updating conversation icon")
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
                .filter(c => c.conversation_type() === wasm.ConversationType.Direct && recipient in c.recipients())
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

    async fetchMessages(conversation_id: string, config: FetchMessagesConfig): Promise<Result<WarpError, FetchMessageResponse>> {
        return this.get(async r => {
            let message_options = new MessageOptions()
            switch (config.type) {
                case "Between": {
                    message_options.set_date_range(config.from, config.to) //TODO verify that js Date can be parsed to rust DateTime::<Utc>
                    break
                }
                case "MostRecent": {
                    let total_messages = await r.get_message_count(conversation_id)
                    message_options.set_range(Math.min(0, total_messages - config.amount), total_messages)
                    break
                }
                case "Earlier": {
                    message_options.set_date_range(new Date(), config.start_date)
                    message_options.set_reverse()
                    message_options.set_limit(config.limit)
                    break
                }
                case "Later": {
                    message_options.set_date_range(config.start_date, new Date())
                    message_options.set_limit(config.limit)
                    break
                }
            }

            let messages = await this.getMessages(r, conversation_id, message_options)
            if (config.type === "Earlier") {
                messages = messages.reverse()
            }
            let has_more = "limit" in config ? messages.length >= config.limit : false

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
            return await this.sendTo(r, conversation_id, message, { attachments })
        }, "Error sending message")
    }

    async sendMultiple(conversation_ids: string[], message: string[], attachments?: FileAttachment[]): Promise<Result<WarpError, MultiSendMessageResult[]>> {
        return await this.get(async r => {
            let sent = []
            for (let conversation_id of conversation_ids) {
                let res: MultiSendMessageResult = { chat: conversation_id, result: await this.sendTo(r, conversation_id, message, { attachments }) }
                sent.push(res)
            }
            return sent
        }, "Error sending message")
    }

    private async sendTo(raygun: wasm.RayGunBox, conversation_id: string, message: string[], settings?: { attachments?: FileAttachment[]; replyTo?: string }): Promise<SendMessageResult> {
        if (settings?.attachments && settings?.attachments.length > 0) {
            // Check for empty messages
            message = message.filter(m => m.length !== 0).length === 0 ? [] : message
            let result = await raygun
                .attach(
                    conversation_id,
                    settings?.replyTo,
                    settings?.attachments.map(f => new wasm.AttachmentFile(f.file, f.attachment ? new wasm.AttachmentStream(f.attachment[1], f.attachment[0]) : undefined)),
                    message
                )
                .then(res => {
                    // message_sent event gets fired AFTER this returns
                    ConversationStore.addPendingMessages(conversation_id, res.get_message_id(), message)
                    createFileAttachHandler(res, (file, updater) => ConversationStore.updatePendingMessages(conversation_id, res.get_message_id(), file, updater))
                    return res
                })
            return {
                message: result.get_message_id(),
                progress: result,
            }
        }
        return {
            message: await (settings?.replyTo ? raygun.reply(conversation_id, settings.replyTo, message) : raygun.send(conversation_id, message)).then(messageId => {
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
            let data = await createFileDownloadHandler(file, result, size)
            if (isAndroidOriOS()) {
                await shareFile(file, Buffer.from(data))
            } else {
                await downloadFileFromWeb(data, size || 0, file)
            }
        }, `Error downloading attachment from ${conversation_id} for message ${message_id}`)
    }

    async getAttachmentRaw(conversation_id: string, message_id: string, file: string, options?: { size?: number; type?: string }) {
        return await this.get(async r => {
            let result = await r.download_stream(conversation_id, message_id, file)
            return createFileDownloadHandlerRaw(file, result, options)
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
            return await this.sendTo(r, conversation_id, message, { attachments, replyTo: message_id })
        }, "Error sending message")
    }

    async sendEvent(conversation_id: string, event: wasm.MessageEvent) {
        return await this.get(r => r.send_event(conversation_id, event), `Error sending event ${event}`)
    }

    async cancelEvent(conversation_id: string, event: wasm.MessageEvent) {
        return await this.get(r => r.cancel_event(conversation_id, event), `Error cancelling event ${event}`)
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
                    let handler = await this.createMessageEventHandler(raygun, conversationId)
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
                case "conversation_archived":
                case "conversation_unarchived": {
                    //TODO
                    break
                }
                case "community_created": {
                    //TODO UI stuff
                    let communityId: string = event.values["community_id"]
                    let listeners = get(this.messageListeners)
                    let handler = await this.createMessageEventHandler(raygun, communityId, true)
                    listeners[communityId] = handler
                    this.messageListeners.set(listeners)

                    break
                }
                case "community_deleted": {
                    let communityId: string = event.values["community_id"]
                    let listeners = get(this.messageListeners)
                    if (communityId in listeners) {
                        listeners[communityId].cancel()
                        delete listeners[communityId]
                        this.messageListeners.set(listeners)
                    }
                    //TODO UI stuff
                    break
                }
                case "community_invited": {
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
            let handler = await this.createMessageEventHandler(raygun, conversation.id())
            handlers[conversation.id()] = handler
        }
        let communities = await raygun.list_communities_joined()
        for (let communitiy of communities) {
            let handler = await this.createMessageEventHandler(raygun, communitiy, true)
            handlers[communitiy] = handler
        }
        this.messageListeners.set(handlers)
    }

    private async createMessageEventHandler(raygun: wasm.RayGunBox, identifier: string, community?: boolean) {
        let stream = community ? await raygun.get_community_stream(identifier) : await raygun.get_conversation_stream(identifier)
        return create_cancellable_handler(async isCancelled => {
            let listener = {
                [Symbol.asyncIterator]() {
                    return stream
                },
            }
            streamLoop: for await (const value of listener) {
                let event = parseJSValue(value)
                log.info(`Handling message event: ${JSON.stringify(event)}`)
                if (community) {
                    //TODO UI Hookup etc not implemented
                    continue
                }
                if (isCancelled()) {
                    log.debug(`Breaking stream loop not necessary anymore from: ${identifier}`)
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
                            let notify = get(page).route.id !== Route.Chat || (get(page).route.id === Route.Chat && activeChat.id !== conversation_id)
                            if (ping || notify) {
                                Store.addToastNotification(
                                    new ToastMessage("New Message", messageToSend, 2, undefined, undefined, () => {
                                        let chat = get(UIStore.state.chats).find(c => c.id === conversation_id)
                                        if (chat) {
                                            Store.setActiveChat(chat)
                                            goto(Route.Chat)
                                        }
                                    }),
                                    { sound: settings.audio.messageSounds ? Sounds.Notification : undefined, context: NotificationType.Messages }
                                )
                            }
                            UIStore.addNotification(conversation_id)
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
                                let users = new Set(c.users)
                                users.add(recipient.key)
                                c.users = [...users]
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
                    case "conversation_permissions_updated": {
                        let conversation_id: string = event.values["conversation_id"]
                        let permissions: {
                            [did: string]: wasm.GroupPermission[]
                        } = {}
                        let chat = await raygun.get_conversation(conversation_id)
                        chat.recipients().forEach(did => {
                            permissions[did] = chat.permissions().get_permissions(did) || []
                        })
                        // For remote this is empty??? bug?
                        // For now just fetch the permissions from raygun again
                        // let added = event.values["added"] as [string, GroupPermission][]
                        // let removed = event.values["removed"] as [string, GroupPermission][]
                        UIStore.mutateChat(conversation_id, c => {
                            if (c.kind === ChatType.Group) {
                                c.settings.permissions = permissions
                            }
                        })
                        break
                    }
                    case "conversation_description_changed": {
                        let conversation_id: string = event.values["conversation_id"]
                        let description: string = event.values["description"]
                        UIStore.mutateChat(conversation_id, c => {
                            c.motd = description
                        })
                        break
                    }
                    case "conversation_updated_icon": {
                        let conversation_id: string = event.values["conversation_id"]
                        let icon = await raygun.conversation_icon(conversation_id)
                        console.log("type ", icon.image_type(), " data ", btoa(icon.data().reduce((data, byte) => data + String.fromCharCode(byte), "")))
                        UIStore.mutateChat(conversation_id, c => {
                            c.icon = imageFromMime(icon.data(), "image/png")
                        })
                        break
                    }
                    case "conversation_updated_banner": {
                        let conversation_id: string = event.values["conversation_id"]
                        let icon = await raygun.conversation_banner(conversation_id)
                        UIStore.mutateChat(conversation_id, c => {
                            c.banner = imageFromData(icon.data(), icon.image_type())
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
            let warpMsgs = msgs.messages()!
            messages = (await Promise.all(warpMsgs.map(async msg => await this.convertWarpMessage(conversation_id, msg)))).filter((m: Message | null): m is Message => m !== null)
        }
        return messages
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
        let attachments = message.attachments()
        let reactions: { [key: string]: Reaction } = {}
        message.reactions().forEach((dids, emoji) => {
            reactions[emoji] = {
                reactors: new Set(dids),
                emoji: emoji,
                highlight: Appearance.Default, //TODO
                description: "", //TODO
            }
        })
        return {
            id: message.id(),
            details: {
                at: message.date(),
                origin: message.sender(),
                remote: remote,
            },
            text: message.lines(),
            inReplyTo: message.replied() ? ConversationStore.getMessage(conversation_id, message.replied()!) : null,
            reactions: reactions,
            attachments: attachments.map(f => convertWarpAttachment(f)),
            pinned: message.pinned(),
            type: messageTypeFromTexts(message.lines()),
        }
    }

    /**
     * Converts warp message to ui message
     */
    private async convertWarpConversation(chat: wasm.Conversation, raygun: wasm.RayGunBox): Promise<Chat> {
        let direct = chat.conversation_type() === wasm.ConversationType.Direct
        let msg = await this.getMessages(raygun, chat.id(), new MessageOptions())
        chat.recipients().forEach(async recipient => {
            let user = await MultipassStoreInstance.identity_from_did(recipient)
            if (user) {
                Store.updateUser(user)
            }
        })
        let permissions: {
            [did: string]: wasm.GroupPermission[]
        } = {}
        chat.recipients().forEach(did => {
            permissions[did] = chat.permissions().get_permissions(did) || []
        })
        return {
            ...defaultChat,
            id: chat.id(),
            name: chat.name() ? chat.name()! : "",
            kind: direct ? ChatType.DirectMessage : ChatType.Group,
            settings: {
                displayOwnerBadge: true,
                readReceipts: true,
                permissions: permissions,
            },
            creator: chat.creator(),
            users: chat.recipients(),
            last_message_at: msg.length > 0 ? msg[msg.length - 1].details.at : new Date(),
            last_message_preview: msg.length > 0 ? msg[msg.length - 1].text.join("\n") : "",
        }
    }
}

export async function createFileDownloadHandlerRaw(name: string, it: wasm.AsyncIterator, options?: { size?: number; type?: string }): Promise<any[]> {
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
    return data
}

export async function createFileDownloadHandler(name: string, it: wasm.AsyncIterator, size?: number): Promise<any[]> {
    let data = await createFileDownloadHandlerRaw(name, it, { size })
    return data
}

/**
 * Create a handler for attachment results that uploads the file to chat and updates pending message attachments
 * TODO: verify it works as we dont have a way to upload files yet
 */
export type ProgressHandler = (progress: FileProgress | undefined) => FileProgress | undefined
export async function createFileAttachHandler(upload: wasm.AttachmentResult, updater: (name: string, handler: ProgressHandler) => void) {
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
                        updater(file, current => {
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

export function convertWarpAttachment(attachment: wasm.File): Attachment {
    let kind: MessageAttachmentKind = MessageAttachmentKind.File
    let type = attachment.file_type()
    let mime = "application/octet-stream"
    if (type !== "Generic") {
        mime = type.Mime
    }
    if (mime.startsWith("image")) {
        kind = MessageAttachmentKind.Image
    } else if (mime.startsWith("video")) {
        kind = MessageAttachmentKind.Video
    }
    let thumbnail = attachment.thumbnail()
    let location = thumbnail.length > 0 ? imageFromData(thumbnail, type) : ""
    return {
        kind: kind,
        name: attachment.name(),
        size: attachment.size(),
        location: location,
        mime: mime,
    }
}

export type GroupPermission = wasm.GroupPermission
export const GroupPermission = wasm.GroupPermission
export const RaygunStoreInstance = new RaygunStore(WarpStore.warp.raygun)
