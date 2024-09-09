import { TypingIndicator, type Chat } from "$lib/types"
import { derived, get, writable, type Writable } from "svelte/store"
import { createPersistentState } from ".."
import { EmojiFont, Font } from "$lib/enums"
import { Store as MainStore } from "../Store"
import { mchats } from "$lib/mock/users"

export interface IUIState {
    color: Writable<string>
    fontSize: Writable<number>
    cssOverride: Writable<string>
    font: Writable<Font>
    emojiFont: Writable<EmojiFont>
    sidebarOpen: Writable<boolean>
    chats: Writable<Chat[]>
    hiddenChats: Writable<Chat[]>
    emojiSelector: Writable<boolean>
    emojiCounter: Writable<{ [emoji: string]: number }>
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
            chats: createPersistentState("uplink.ui.chats", [], {
                deserializer: (c: Chat[]) => {
                    // The typing indicator is read as an {}. Init it properly here
                    for (let ch of c) {
                        ch.typing_indicator = new TypingIndicator()
                    }
                    return c
                },
            }),
            hiddenChats: createPersistentState("uplink.ui.hiddenChats", []),
            emojiSelector: writable(false),
            emojiCounter: createPersistentState("uplink.ui.emojiCounter", { "👍": 0, "👎": 0, "❤️": 0, "🖖": 0, "😂": 0 }),
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
        const currentchats = get(this.state.chats)
        if (!currentchats.some(c => c.id === chat.id)) {
            this.state.chats.set([chat, ...currentchats])
        }
    }

    removeSidebarChat(chat: Chat | string) {
        let id = typeof chat === "string" ? chat : chat.id
        this.state.hiddenChats.update(hiddenChats => {
            let chat = get(this.state.chats).find(c => c.id === id)
            if (chat) {
                hiddenChats.push(chat)
            }
            return hiddenChats
        })
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

    addNotification(conversationId: string) {
        if (get(MainStore.state.activeChat).id !== conversationId) {
            this.mutateChat(conversationId, chat => {
                chat.notifications++
            })
        }
    }

    clearNotifications(conversationId: string) {
        this.mutateChat(conversationId, chat => {
            chat.notifications = 0
        })
    }

    getNotifications(conversationId: string) {
        return get(this.state.chats).find(c => c.id === conversationId)?.notifications || 0
    }

    getTotalNotifications() {
        return get(this.state.chats).reduce((acc, chat) => {
            return acc + chat.notifications
        }, 0)
    }

    updateTypingIndicators() {
        let mocks = mchats.map(c => c.id)
        let chats = get(this.state.chats)
        let update = false
        for (let chat of chats) {
            if (chat.id in mocks) continue
            if (chat.typing_indicator.update()) {
                update = true
            }
        }
        if (update) {
            this.state.chats.update(c => c)
        }
        MainStore.state.activeChat.update(c => {
            c.typing_indicator.update()
            return c
        })
    }

    useEmoji(emoji: string) {
        this.state.emojiCounter.update(counter => {
            if (emoji in counter) {
                counter[emoji] += 1
            } else {
                counter[emoji] = 1
            }
            return counter
        })
    }

    getMostUsed(top?: number) {
        top = top ? top : 5
        return derived(this.state.emojiCounter, counter => {
            return Object.entries(counter)
                .sort((f, s) => s[1] - f[1])
                .map(v => v[0])
        })
    }
}

export const UIStore = new Store()
