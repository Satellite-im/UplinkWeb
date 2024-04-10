import type { Chat, Keybind } from "$lib/types"
import type { Locale } from "javascript-time-ago"
import { get, type Writable } from "svelte/store"
import { createPersistentState, defaultSettings } from ".."
import { Font } from "$lib/enums"

export interface IUIState {
    color: Writable<string>,
    fontSize: Writable<number>,
    cssOverride: Writable<string>,
    font: Writable<Font>,
    sidebarOpen: Writable<boolean>,
    chats: Writable<Chat[]>,
    
}

class Store {
    state: IUIState

    constructor() {
        this.state = {
            color: createPersistentState("uplink.color", "#4d4dff"),
            fontSize: createPersistentState("uplink.ui.fontSize", 1.0),
            font: createPersistentState("uplink.ui.font", Font.Poppins),
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

    increaseFontSize(amount: number = 0.025) {
        this.state.fontSize.update((s) => (s + amount <= 1.5) ? s += amount : s)
    }

    decreaseFontSize(amount: number = 0.025) {
        this.state.fontSize.update((s) => (s - amount >= 0.8) ? s -= amount : s)
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
        const currentchats = get(this.state.chats)
        if (!currentchats.some(c => c.id === chat.id)) {
            this.state.chats.set([...currentchats, chat])
        }
    }

    removeSidebarChat(chat: Chat) {
        this.state.chats.set(
            get(this.state.chats).filter(c => c.id !== chat.id)
        )
    }

}

export const UIStore = new Store()