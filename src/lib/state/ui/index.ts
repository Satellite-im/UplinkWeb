import type { Chat } from "$lib/types"
import { get, type Writable } from "svelte/store"
import { createPersistentState } from ".."
import { EmojiFont, Font } from "$lib/enums"
import { Store as MainStore } from "../Store"

export interface IUIState {
    color: Writable<string>
    fontSize: Writable<number>
    cssOverride: Writable<string>
    font: Writable<Font>
    emojiFont: Writable<EmojiFont>
    sidebarOpen: Writable<boolean>
    chats: Writable<Chat[]>
}

class Store {
    state: IUIState

    constructor() {
        this.state = {
            color: createPersistentState("uplink.color", "#4d4dff"),
            fontSize: createPersistentState("uplink.ui.fontSize", 1.0),
            font: createPersistentState("uplink.ui.font", Font.Poppins),
            emojiFont: createPersistentState("uplink.ui.emojiFont", EmojiFont.Fluent),
            cssOverride: createPersistentState("uplink.ui.cssOverride", ""),
            sidebarOpen: createPersistentState("uplink.ui.sidebarOpen", true),
            chats: createPersistentState("uplink.ui.chats", []),
        }
    }

    setCssOverride(css: string) {
        this.state.cssOverride.set(css)
    }

    setThemeColor(color: string) {
        this.state.color.set(color)
    }

    setFont(font: Font) {
        this.state.font.set(font)
    }

    setEmojiFont(font: EmojiFont) {
        this.state.emojiFont.set(font)
    }

    increaseFontSize(amount: number = 0.025) {
        this.state.fontSize.update(s => (s + amount <= 1.5 ? (s += amount) : s))
    }

    decreaseFontSize(amount: number = 0.025) {
        this.state.fontSize.update(s => (s - amount >= 0.8 ? (s -= amount) : s))
    }

    openSidebar() {
        this.state.sidebarOpen.set(true)
    }

    closeSidebar() {
        this.state.sidebarOpen.set(false)
    }

    toggleSidebar() {
        const current = get(this.state.sidebarOpen)
        this.state.sidebarOpen.set(!current)
    }

    addSidebarChat(chat: Chat) {
        console.log("Addgin ", chat)
        const currentchats = get(this.state.chats)
        if (!currentchats.some(c => c.id === chat.id)) {
            this.state.chats.set([chat, ...currentchats])
        }
    }

    removeSidebarChat(chat: Chat | string) {
        let id = typeof chat === "string" ? chat : chat.id
        this.state.chats.set(get(this.state.chats).filter(c => c.id !== id))
    }

    mutateChat(conversationId: string, handler: (chat: Chat) => void) {
        let chats = get(this.state.chats)
        let chat = chats.find(c => c.id === conversationId)
        if (chat) {
            handler(chat)
            this.state.chats.set(chats)
            let active = get(MainStore.state.activeChat)
            if (active.id === conversationId) {
                handler(active)
                MainStore.state.activeChat.set(active)
            }
        }
    }
}

export const UIStore = new Store()
