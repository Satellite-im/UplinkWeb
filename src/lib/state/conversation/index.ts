import type { MessageGroup, Chat } from "$lib/types"
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
}