import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { Store } from "../state/store"
import { UIStore } from "../state/ui"
import { ConversationStore } from "../state/conversation"
import { MessageOptions } from "warp-wasm"
import { ChatType } from "$lib/enums"
import { type User, type Chat, defaultChat, type Message, defaultUser, mentions_user } from "$lib/types"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import { create_cancellable_handler, type Cancellable } from "$lib/utils/CancellablePromise"
import { parseJSValue } from "./EnumParser"
import { MultipassStoreInstance } from "./MultipassStore"

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
          }
      }

type Range = {
    start: any
    end: any
}

class RaygunStore {
    private raygunWritable: Writable<wasm.RayGunBox | null>
    // A map of message listeners
    private messageListeners: Writable<{ [key: string]: Cancellable }>

    constructor(multipass: Writable<wasm.RayGunBox | null>) {
        this.raygunWritable = multipass
        this.messageListeners = writable({})
        this.raygunWritable.subscribe(r => {
            if (r) {
                this.handleRaygunEvent(r)
                let listeners = get(this.messageListeners)
                if (Object.keys(listeners).length > 0) {
                    // Cancels current message event listeners
                    for (let handler of Object.values(listeners)) {
                        handler.cancel()
                    }
                }
                this.initConversationHandlers(r)
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
                        new wasm.GroupSettings()
                    ),
                    r
                ),
            "Error creating new group conversation"
        )
    }

    async addGroupParticipants(conversation_id: string, recipients: string[]) {
        return await this.get(r => {
            for (let recipient of recipients) {
                //TODO. Not impl for wasm atm
            }
            return conversation_id
        }, "Error adding participants")
    }

    async removeGroupParticipants(conversation_id: string, recipients: string[]) {
        return await this.get(r => {
            for (let recipient of recipients) {
                //TODO. Not impl for wasm atm
            }
            return conversation_id
        }, "Error removing participants")
    }

    async updateConversationName(conversation_id: string, name: string) {
        return await this.get(r => {
            //TODO. Not impl for wasm atm
            return conversation_id
        }, "Error updating conversation name")
    }

    async updateConversationSettings(conversation_id: string, settings: ConversationSettings) {
        return await this.get(r => r.update_conversation_settings(conversation_id, settings), "Error deleting message")
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
            let convs = (await r.list_conversations()) as wasm.Conversation[]
            convs
                .filter(c => parseJSValue(c.settings()).type === "direct" && recipient in c.recipients())
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
            let convs = (await r.list_conversations()) as wasm.Conversation[]
            return await Promise.all(convs.map(c => this.convertWarpConversation(c, r)))
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

    // TODO wasm only supports plain message without attachments atm
    async send(conversation_id: string, message: string[]): Promise<Result<WarpError, SendMessageResult>> {
        return await this.get(async r => {
            return {
                message: await r.send(conversation_id, message),
            }
        }, "Error sending message")
    }

    // TODO wasm only supports plain message without attachments atm
    async sendMultiple(conversation_ids: string[], message: string[]): Promise<Result<WarpError, MultiSendMessageResult[]>> {
        return await this.get(async r => {
            let sent = []
            for (let conversation_id of conversation_ids) {
                let res: MultiSendMessageResult = { chat: conversation_id, result: { message: await r.send(conversation_id, message) } }
                sent.push(res)
            }
            return sent
        }, "Error sending message")
    }

    async edit(conversation_id: string, message_id: string, message: string[]) {
        return await this.get(r => r.edit(conversation_id, message_id, message), "Error editing message")
    }

    // TODO wasm only supports plain message without attachments atm
    async downloadAttachment(conversation_id: string, message_id: string, file: string, destination: string) {}

    async react(conversation_id: string, message_id: string, state: wasm.ReactionState, emoji: string) {
        let result = await this.get(r => r.react(conversation_id, message_id, state, emoji), "Error reacting to message")
        return result.map(_ => {
            ConversationStore.editReaction(get(Store.state.activeChat).id, message_id, emoji, state == wasm.ReactionState.Add)
        })
    }

    async pin(conversation_id: string, message_id: string, pin: boolean) {
        return await this.get(r => r.pin(conversation_id, message_id, pin ? wasm.PinState.Pin : wasm.PinState.Unpin), "Error pinning message")
    }

    async reply(conversation_id: string, message_id: string, message: string[]): Promise<Result<WarpError, SendMessageResult>> {
        return await this.get(async r => {
            return {
                message: await r.reply(conversation_id, message_id, message),
            }
        }, "Error replying to message")
    }

    async sendEvent(conversation_id: string, event: wasm.MessageEvent) {
        return await this.get(r => r.send_event(conversation_id, event), `Error sending event ${event}`)
    }

    private async handleRaygunEvent(raygun: wasm.RayGunBox) {
        let events = await raygun.raygun_subscribe()
        let listener = {
            [Symbol.asyncIterator]() {
                return events
            },
        }
        for await (const value of listener) {
            let event = parseJSValue(value)
            get(Store.state.logger).info(`Handling conversation event: ${JSON.stringify(event)}`)
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
                    let conversations = get(ConversationStore.conversations)
                    ConversationStore.conversations.set(conversations.filter(c => c.id !== conversationId))
                    if (get(Store.state.activeChat).id === conversationId) {
                        Store.clearActiveChat()
                    }
                    break
                }
            }
        }
    }

    private async initConversationHandlers(raygun: wasm.RayGunBox) {
        let conversations: wasm.Conversation[] = await raygun.list_conversations()
        let handlers: { [key: string]: Cancellable } = {}
        for (let conversation of conversations) {
            let handler = await this.createConversationEventHandler(raygun, conversation.id())
            handlers[conversation.id()] = handler
        }
        this.messageListeners.set(handlers)
    }

    private async createConversationEventHandler(raygun: wasm.RayGunBox, conversation_id: string) {
        let stream = await raygun.get_conversation_stream(conversation_id)
        return create_cancellable_handler(async () => {
            let listener = {
                [Symbol.asyncIterator]() {
                    return stream
                },
            }
            for await (const value of listener) {
                let event = parseJSValue(value)
                get(Store.state.logger).info(`Handling messarge event: ${JSON.stringify(event)}`)
                switch (event.type) {
                    case "message_sent": {
                        let conversation_id: string = event.values["conversation_id"]
                        let message_id: string = event.values["message_id"]
                        // Needs a delay because raygun does not contain the sent message yet
                        await new Promise(f => setTimeout(f, 10))
                        let message = await this.convertWarpMessage(conversation_id, await raygun.get_message(conversation_id, message_id))
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
                            //TODO move chat to top
                            //TODO handle ping and notification
                        }
                        break
                    }
                    case "message_edited": {
                        let conversation_id: string = event.values["conversation_id"]
                        let message_id: string = event.values["message_id"]
                        let message = await this.convertWarpMessage(conversation_id, await raygun.get_message(conversation_id, message_id))
                        if (message) {
                            ConversationStore.editMessage(conversation_id, message_id, message.text.join("\n"))
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
                                c.users = [...c.users, recipient]
                            })
                        }
                        break
                    }
                    case "recipient_removed": {
                        let conversation_id: string = event.values["conversation_id"]
                        let recipient = event.values["recipient"]
                        UIStore.mutateChat(conversation_id, c => {
                            c.users = c.users.filter(u => u.key !== recipient)
                        })
                        break
                    }
                    case "event_received": {
                        let conversation_id: string = event.values["conversation_id"]
                        let did_key = event.values["did_key"]
                        let msg_event = parseJSValue(event.values["event"])
                        if (msg_event.type === "typing") {
                            UIStore.mutateChat(conversation_id, c => {
                                c.typing_indicator[did_key] = new Date()
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
                        get(Store.state.logger).error(`Unhandled message event: ${JSON.stringify(event)}`)
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
            let warpMsgs = msgs.value() as wasm.Message[]
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
                console.log(`${err}: ${error}`)
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
        let sender = remote ? (await MultipassStoreInstance.identity_from_did(message.sender()))! : user
        return {
            id: message.id(),
            details: {
                at: message.date(),
                origin: sender,
                remote: remote,
            },
            text: message.lines(),
            inReplyTo: message.replied() ? ConversationStore.getMessage(conversation_id, message.replied()!) : null,
            reactions: message.reactions(),
            attachments: message.attachments(),
            pinned: message.pinned(),
        }
    }

    /**
     * Converts warp message to ui message
     */
    private async convertWarpConversation(chat: wasm.Conversation, raygun: wasm.RayGunBox): Promise<Chat> {
        let setting = parseJSValue(chat.settings())
        let direct = setting.type === "direct"
        let msg = await this.getMessages(raygun, chat.id(), new MessageOptions())
        let creator = chat.creator() ? await MultipassStoreInstance.identity_from_did(chat.creator()!) : undefined
        let users = await Promise.all(
            chat.recipients().map(async r => {
                let rec = await MultipassStoreInstance.identity_from_did(r)
                return rec ? rec : defaultUser
            })
        )
        return {
            ...defaultChat,
            id: chat.id(),
            name: chat.name() ? chat.name()! : "",
            kind: direct ? ChatType.DirectMessage : ChatType.Group,
            settings: {
                displayOwnerBadge: true,
                readReciepts: true,
                permissions: {
                    allowAnyoneToAddUsers: !direct && (setting.values["members_can_add_participants"] as boolean),
                    allowAnyoneToModifyPhoto: false,
                    allowAnyoneToModifyName: !direct && (setting.values["members_can_change_name"] as boolean),
                },
            },
            creator: creator,
            users: users,
            last_message_at: msg.length > 0 ? msg[msg.length - 1].details.at : new Date(),
            last_message_preview: msg.length > 0 ? msg[msg.length - 1].text.join("\n") : "",
        }
    }
}

export const RaygunStoreInstance = new RaygunStore(WarpStore.warp.raygun)
