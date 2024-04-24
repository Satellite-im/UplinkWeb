import type { MessageGroup, Chat, Message } from "$lib/types"
import { get, writable, type Writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"
import { getStateFromDB, setStateToDB } from ".."
import { mock_messages } from "$lib/mock/messages"

export type ConversationMessages = {
    id: string,
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
        const dbConversations = await getStateFromDB<ConversationMessages[]>('conversations', [])
        this.conversations.set(dbConversations)
    }

    getConversation(chat: Chat) {
        return get(this.conversations).find(c => c.id === chat.id)
    }

    async addMessage(chat: Chat, message: Message) {
        const conversations = get(this.conversations)
        const conversationIndex = conversations.findIndex(c => c.id === chat.id)

        message.id = uuidv4()

        if (conversationIndex !== -1) {
            const conversation = conversations[conversationIndex]
            const lastGroup = conversation.messages[conversation.messages.length - 1]
            const now = new Date()

            if (lastGroup && lastGroup.details.origin === message.details.origin &&
                (now.getTime() - new Date(lastGroup.details.at).getTime()) < 60000) {
                lastGroup.messages.push(message)
            } else {
                const newMessageGroup: MessageGroup = {
                    details: message.details,
                    messages: [message]
                }
                conversation.messages.push(newMessageGroup)
            }
        } else {
            const newConversation: ConversationMessages = {
                id: chat.id,
                messages: [{
                    details: message.details,
                    messages: [message]
                }]
            }
            conversations.push(newConversation)
        }
        this.conversations.set(conversations)
        await setStateToDB('conversations', conversations)
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
                        text: [ editedContent ]
                    }
                }
            })

            this.conversations.set(conversations)
            await setStateToDB('conversations', conversations)
        }
    }

    async removeMessage(chat: Chat, messageId: string) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat.id)

        if (conversation) {
            conversation.messages.forEach(group => {
                const index = group.messages.findIndex(m => m.id === messageId)
                if (index !== -1) {
                    group.messages.splice(index, 1)
                }
            })
            conversation.messages = conversation.messages.filter(group => group.messages.length > 0)
            this.conversations.set(conversations)
            await setStateToDB('conversations', conversations)
        }
    }

    async loadMockData() {
        console.log('conversations', get(this.conversations))
        const firstChatId = get(this.conversations)[0].id
        const initialData: ConversationMessages = {
            id: firstChatId,
            messages: mock_messages
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
        console.log('adding mock data')
    }
}

export const ConversationStore = new Conversations()