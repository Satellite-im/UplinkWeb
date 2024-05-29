import { get, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { Store } from "../state/store"
import { UIStore } from "../state/ui"
import { ConversationStore } from "../state/conversation"
import { MessageOptions } from "warp-wasm"
import { ChatType } from "$lib/enums"
import { MultipassStoreInstance } from "./MultipassStore"
import type { User } from "$lib/types"

class RaygunStore {
    private raygunWritable: Writable<wasm.RayGunBox | null>

    constructor(multipass: Writable<wasm.RayGunBox | null>) {
        this.raygunWritable = multipass
    }

    async create_conversation(did: string) {
        let conversation = this.get(r => r.create_conversation(did), "Error creating new conversation")
        await conversation.then(async conv => {
            if (conv) {
                let users = (
                    await Promise.all(
                        conv.recipients().flatMap(r => {
                            return MultipassStoreInstance.identity_from_did(r)
                        })
                    )
                ).filter((r): r is User => r !== undefined)
                let chat = {
                    id: conv.id(),
                    name: conv.name() ? conv.name()! : conv.recipients()[0],
                    motd: "",
                    kind: ChatType.DirectMessage,
                    settings: {
                        displayOwnerBadge: true,
                        readReciepts: true,
                        permissions: {
                            allowAnyoneToAddUsers: false,
                            allowAnyoneToModifyPhoto: false,
                            allowAnyoneToModifyName: false,
                        },
                    },
                    creator: get(Store.state.user),
                    notifications: 0,
                    activity: false,
                    users: [get(Store.state.user), ...users],
                    last_message_at: new Date(),
                    last_message_preview: "",
                }
                UIStore.addSidebarChat(chat)
            }
        })
    }

    async create_group_conversation(name: string | undefined, recipients: string[]) {
        let conversation = this.get(r => r.create_group_conversation(name, recipients, new wasm.GroupSettings()), "Error creating new group conversation")
        await conversation.then(async conv => {
            if (conv) {
                let users = (
                    await Promise.all(
                        conv.recipients().flatMap(r => {
                            return MultipassStoreInstance.identity_from_did(r)
                        })
                    )
                ).filter((r): r is User => r !== undefined)
                let chat = {
                    id: conv.id(),
                    name: conv.name() ? conv.name()! : conv.recipients()[0],
                    motd: "",
                    kind: ChatType.Group,
                    settings: {
                        displayOwnerBadge: true,
                        readReciepts: true,
                        permissions: {
                            allowAnyoneToAddUsers: false,
                            allowAnyoneToModifyPhoto: false,
                            allowAnyoneToModifyName: false,
                        },
                    },
                    creator: get(Store.state.user),
                    notifications: 0,
                    activity: false,
                    users: [get(Store.state.user), ...users],
                    last_message_at: new Date(),
                    last_message_preview: "",
                }
                UIStore.addSidebarChat(chat)
            }
        })
    }

    async get_conversation(conversation_id: string) {
        return this.subscribe(r => r.get_conversation(conversation_id), `Error fetching conversation with id ${conversation_id}`)
    }

    async list_conversations() {
        return this.subscribe(r => r.list_conversations(), `Error fetching conversations`)
    }

    async get_message(conversation_id: string, message_id: string) {
        return this.subscribe(r => r.get_message(conversation_id, message_id), `Error fetching message for conversation ${conversation_id}`)
    }

    async get_message_count(conversation_id: string) {
        return this.subscribe(r => r.get_message_count(conversation_id), `Error fetching message count for conversation ${conversation_id}`)
    }

    async message_status(conversation_id: string, message_id: string) {
        return this.subscribe(r => r.message_status(conversation_id, message_id), `Error fetching message status for conversation ${conversation_id}`)
    }

    async get_messages(conversation_id: string, options: MessageOptions) {
        return this.subscribe(r => r.get_messages(conversation_id, options), `Error fetching messages for conversation ${conversation_id}`)
    }

    async send(conversation_id: string, message: string[]) {
        let newMessage = {
            id: "",
            details: {
                at: new Date(),
                origin: get(Store.state.user),
                remote: false,
            },
            text: message,
            inReplyTo: null,
            reactions: {},
            attachments: [],
            pinned: false,
        }
        let prom = this.get(r => r.send(conversation_id, message), "Error sending message")
        await prom.then(_ => {
            ConversationStore.addMessage(get(Store.state.activeChat), newMessage)
        })
    }

    async edit(conversation_id: string, message_id: string, message: string[]) {
        let prom = this.get(r => r.edit(conversation_id, message_id, message), "Error editing message")
        await prom.then(_ => {
            ConversationStore.editMessage(get(Store.state.activeChat), message_id, message.join("\n"))
        })
    }

    async delete(conversation_id: string, message_id?: string) {
        let prom = this.get(r => r.delete(conversation_id, message_id), "Error deleting message")
        await prom.then(_ => {
            if (message_id) ConversationStore.removeMessage(conversation_id, message_id)
            else {
                let conversations = get(ConversationStore.conversations)
                ConversationStore.conversations.set(conversations.filter(c => c.id !== conversation_id))
            }
        })
    }

    async react(conversation_id: string, message_id: string, state: wasm.ReactionState, emoji: string) {
        let prom = this.get(r => r.react(conversation_id, message_id, state, emoji), "Error reacting to message")
        await prom.then(async _ => {
            ConversationStore.editReaction(get(Store.state.activeChat), message_id, emoji)
        })
    }

    async pin(conversation_id: string, message_id: string, pin: boolean) {
        let prom = this.get(r => r.pin(conversation_id, message_id, pin ? wasm.PinState.Pin : wasm.PinState.Unpin), "Error pinning message")
        await prom.then(_ => {
            ConversationStore.pinMessage(get(Store.state.activeChat), message_id, pin)
        })
    }

    async reply(conversation_id: string, message_id: string, message: string[]) {
        let prom = this.get(r => r.reply(conversation_id, message_id, message), "Error replying to message")
        await prom.then(async _ => {
            let reply = this.convert_message(conversation_id, await this.get_message(conversation_id, message_id))
            let newMessage = {
                id: "",
                details: {
                    at: new Date(),
                    origin: get(Store.state.user),
                    remote: false,
                },
                text: message,
                inReplyTo: reply,
                reactions: {},
                attachments: [],
                pinned: false,
            }
            ConversationStore.addMessage(get(Store.state.activeChat), newMessage)
        })
    }

    async update_conversation_settings(conversation_id: string, direct: boolean) {
        let prom = this.get(r => r.update_conversation_settings(conversation_id, direct ? 1 : 0), "Error deleting message")
        await prom.then(msg => {
            // TODO: sync with Store
        })
    }

    async get_conversation_stream(conversation_id: string) {
        return this.subscribe(r => r.get_conversation_stream(conversation_id), `Error getting conversation stream for ${conversation_id}`)
    }

    async send_event(conversation_id: string, event: wasm.MessageEvent) {
        let prom = this.get(r => r.send_event(conversation_id, event), `Error sending event ${event}`)
        await prom.then(msg => {
            // TODO: sync with Store
        })
    }

    /**
     * Convenient helper method to get data from raygun
     */
    private async get<T>(handler: (raygun: wasm.RayGunBox) => Promise<T>, err: string): Promise<T | undefined> {
        let raygun = get(this.raygunWritable)
        if (raygun) {
            try {
                return await handler(raygun)
            } catch (error) {
                console.log(`${err}: ${error}`)
            }
        }
        return undefined
    }

    /**
     * Convenient helper method to subscribe to changes from raygun while getting a value
     */
    private async subscribe<T>(handler: (raygun: wasm.RayGunBox) => T, err: string): Promise<T | undefined> {
        return await new Promise<T | undefined>((resolve, _object) => {
            this.raygunWritable.subscribe(async raygun => {
                if (raygun) {
                    try {
                        return resolve(handler(raygun))
                    } catch (error) {
                        console.log(`${err}: ${error}`)
                    }
                }
                return undefined
            })
        })
    }

    private convert_message(conversation_id: string, message: wasm.Message | undefined) {
        if (!message) return null
        return {
            id: message.id(),
            details: {
                at: message.date(),
                origin: get(Store.state.user),
                remote: false,
            },
            text: message.lines(),
            inReplyTo: null, // TODO get replying message from store. or do what we do for native and just wrap the wasm message
            reactions: message.reactions(),
            attachments: message.attachments(),
            pinned: message.pinned(),
        }
    }
}

export const RaygunStoreInstance = new RaygunStore(WarpStore.warp.raygun)
