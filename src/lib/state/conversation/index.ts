import type { MessageGroup, Chat, Message } from "$lib/types"
import { writable, type Writable } from "svelte/store"

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
        
    }

    addMessage(chat: Chat, message: Message) {

    }

    editMessage(chat: Chat, message: Message, edited: Message) {

    }

    removeMessage(chat: Chat, message: Message) {
        
    }
}