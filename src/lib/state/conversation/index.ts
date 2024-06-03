import type { MessageGroup, Chat, Message } from "$lib/types"
import { get, writable, type Writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { getStateFromDB, setStateToDB } from ".."
import { mock_messages } from "$lib/mock/messages"
import { Appearance } from "$lib/enums"
import { Store } from "../store"

export type ConversationMessages = {
    id: string
    messages: MessageGroup[]
}

class Conversations {
    conversations: Writable<ConversationMessages[]>

    constructor() {
        this.conversations = writable([])
        this.loadConversations()
    }

    async loadConversations() {
        // TODO: Instead of storing all conversations under one entry, we should store each conversation in it's own table row.
        const dbConversations = await getStateFromDB<ConversationMessages[]>("conversations", [])
        this.conversations.set(dbConversations)
    }

    getConversation(chat: Chat) {
        return get(this.conversations).find(c => c.id === chat.id)
    }

    async addMessage(chat: Chat, message: Message) {
        const conversations = get(this.conversations)
        const conversationIndex = conversations.findIndex(c => c.id === chat.id)

        if (message.id === "") message.id = uuidv4()

        if (conversationIndex !== -1) {
            const conversation = conversations[conversationIndex]
            const lastGroup = conversation.messages[conversation.messages.length - 1]
            const now = new Date()

            if (lastGroup && lastGroup.details.origin === message.details.origin && now.getTime() - new Date(lastGroup.details.at).getTime() < 60000) {
                lastGroup.messages.push(message)
            } else {
                const newMessageGroup: MessageGroup = {
                    details: message.details,
                    messages: [message],
                }
                conversation.messages.push(newMessageGroup)
            }
        } else {
            const newConversation: ConversationMessages = {
                id: chat.id,
                messages: [
                    {
                        details: message.details,
                        messages: [message],
                    },
                ],
            }
            conversations.push(newConversation)
        }
        this.conversations.set(conversations)
        await setStateToDB("conversations", conversations)
    }

    async editMessage(chat: Chat, messageId: string, editedContent: string) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat.id)
        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    group.messages[messageIndex] = {
                        ...group.messages[messageIndex],
                        text: [editedContent],
                    }
                }
            })

            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    async editReaction(chat: Chat, messageId: string, emoji: string) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat.id)
        const user = get(Store.state.user).key

        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    const reactions = group.messages[messageIndex].reactions
                    const reaction = reactions[emoji]
                    if (reaction !== undefined && reaction.reactors.has(user)) {
                        let reactors = reaction.reactors
                        reactors.delete(user)
                        if (reactors.size === 0) {
                            delete reactions[emoji]
                        } else {
                            reactions[emoji] = {
                                ...reaction,
                                reactors,
                            }
                        }
                    } else {
                        if (reaction !== undefined) {
                            reactions[emoji] = {
                                ...reaction,
                                reactors: reaction.reactors.add(user),
                            }
                        } else {
                            reactions[reaction] = {
                                reactors: new Set(user),
                                emoji: emoji,
                                highlight: Appearance.Default, //TODO
                                description: "", //TODO
                            }
                        }
                    }
                    group.messages[messageIndex] = {
                        ...group.messages[messageIndex],
                        reactions: reactions,
                    }
                }
            })

            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    async removeMessage(chat: string, messageId: string) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat)

        if (conversation) {
            conversation.messages.forEach(group => {
                const index = group.messages.findIndex(m => m.id === messageId)
                if (index !== -1) {
                    group.messages.splice(index, 1)
                }
            })
            conversation.messages = conversation.messages.filter(group => group.messages.length > 0)
            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    async pinMessage(chat: Chat, messageId: string, pin: boolean) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat.id)
        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    group.messages[messageIndex] = {
                        ...group.messages[messageIndex],
                        pinned: pin,
                    }
                }
            })

            this.conversations.set(conversations)
            await setStateToDB("conversations", conversations)
        }
    }

    getMessage(chat: string, messageId: string): Message | null {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat)
        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === messageId)
                if (messageIndex !== -1) {
                    return group.messages[messageIndex]
                }
            })
        }
        return null
    }

    async loadMockData() {
        const firstChatId = get(this.conversations)[0].id
        const initialData: ConversationMessages = {
            id: firstChatId,
            messages: mock_messages,
        }
        this.conversations.update(currentConversations => {
            const index = currentConversations.findIndex(c => c.id === firstChatId)
            if (index !== -1) {
                currentConversations[index] = initialData
            } else {
                currentConversations.push(initialData)
            }
            return currentConversations
        })
        await setStateToDB("conversations", get(this.conversations))
    }
}

export const ConversationStore = new Conversations()
