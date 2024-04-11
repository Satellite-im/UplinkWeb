import type { MessageGroup, Chat, Message } from "$lib/types"
import { get, writable, type Writable } from "svelte/store"
import { v4 as uuidv4 } from "uuid"


export type ConversationMessages = {
    id: string,
    messages: MessageGroup[]
}

class Conversations {
    conversations: Writable<ConversationMessages[]>

    constructor() {
        this.conversations = writable([])
    }

    getConversation(chat: Chat) {
        return get(this.conversations).find(c => c.id === chat.id)
    }

    addMessage(chat: Chat, message: Message) {
        const conversations = get(this.conversations)
        const conversationIndex = conversations.findIndex(c => c.id === chat.id)

        message.id = uuidv4()

        if (conversationIndex !== -1) {
            const conversation = conversations[conversationIndex]
            const lastGroup = conversation.messages[conversation.messages.length - 1]
            const now = new Date()

            if (lastGroup && lastGroup.details.origin === message.details.origin &&
                (now.getTime() - new Date(lastGroup.details.at).getTime()) < 60000) {
                const updatedLastGroup = {
                    ...lastGroup,
                    messages: [...lastGroup.messages, message]
                }
                conversation.messages[conversation.messages.length - 1] = updatedLastGroup
            } else {
                const newMessageGroup: MessageGroup = {
                    details: message.details,
                    messages: [message]
                }
                conversation.messages.push(newMessageGroup)
            }

            const updatedConversations = [...conversations]
            updatedConversations[conversationIndex] = conversation
            this.conversations.set(updatedConversations)
        } else {
            const newConversation: ConversationMessages = {
                id: chat.id,
                messages: [{
                    details: message.details,
                    messages: [message]
                }]
            }
            this.conversations.update(convs => [...convs, newConversation])
        }

        console.log('conversations', get(this.conversations))
    }

    editMessage(chat: Chat, message: Message, editedContent: string) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat.id)

        if (conversation) {
            conversation.messages.forEach(group => {
                const messageIndex = group.messages.findIndex(m => m.id === message.id)
                if (messageIndex !== -1) {
                    // Update the message content
                    const message = group.messages[messageIndex]
                    group.messages[messageIndex] = {
                        ...message,
                        text: [editedContent]
                    }
                }
            })

            this.conversations.set(conversations)
        }
    }

    removeMessage(chat: Chat, message: Message) {
        const conversations = get(this.conversations)
        const conversation = conversations.find(c => c.id === chat.id)

        if (conversation) {
            conversation.messages.forEach(group => {
                const index = group.messages.findIndex(m => m.id === message.id)
                if (index !== -1) {
                    group.messages.splice(index, 1)
                }
            })
            conversation.messages = conversation.messages.filter(group => group.messages.length > 0)
            this.conversations.set(conversations)
        }
    }
}

export const ConversationStore = new Conversations()