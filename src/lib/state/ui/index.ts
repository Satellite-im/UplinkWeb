import { TypingIndicator, type Chat, type FontOption } from "$lib/types"
import { derived, get, writable, type Writable } from "svelte/store"
import { createPersistentState } from ".."
import { EmojiFont, Font, Identicon, Route } from "$lib/enums"
import { Store as MainStore } from "../Store"
import { mchats } from "$lib/mock/users"
import { page } from "$app/stores"

export interface IUIState {
    color: Writable<string>
    fontSize: Writable<number>
    cssOverride: Writable<string>
    font: Writable<FontOption>
    allFonts: Writable<FontOption[]>
    emojiFont: Writable<EmojiFont>
    identicon: Writable<Identicon>
    theme: Writable<string>
    sidebarOpen: Writable<boolean>
    chats: Writable<Chat[]>
    hiddenChats: Writable<Chat[]>
    simpleUnreads: Writable<boolean>
    emojiSelector: Writable<boolean>
    emojiCounter: Writable<{ [emoji: string]: number }>
    selectedSkinTone: Writable<string>
    marketOpen: Writable<boolean>
}
class Store {
    state: IUIState

    constructor() {
        this.state = {
            color: createPersistentState("uplink.color", "#4d4dff"),
            fontSize: createPersistentState("uplink.ui.fontSize", 1.0),
            font: createPersistentState("uplink.ui.font", { text: Font.Poppins, value: Font.Poppins }),
            allFonts: createPersistentState("uplink.ui.allFonts", [] as FontOption[]),
            identicon: createPersistentState("uplink.ui.identicon", Identicon.PixelArtNeutral),
            emojiFont: createPersistentState("uplink.ui.emojiFont", EmojiFont.Fluent),
            theme: createPersistentState("uplink.ui.theme", "default"),
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
            simpleUnreads: writable(true),
            emojiSelector: writable(false),
            emojiCounter: createPersistentState("uplink.ui.emojiCounter", { "👍": 0, "👎": 0, "❤️": 0, "🖖": 0, "😂": 0 }),
            selectedSkinTone: createPersistentState("uplink.ui.emojiSkintone", ""),
            marketOpen: writable(false),
        }
    }

    setAllAvailableFonts(fonts: FontOption[]) {
        this.state.allFonts.set(fonts)
    }

    setCssOverride(css: string) {
        this.state.cssOverride.set(css)
    }

    setThemeColor(color: string) {
        this.state.color.set(color)
    }

    setFont(font: FontOption) {
        this.state.font.set(font)
    }

    setTheme(theme: string) {
        this.state.theme.set(theme)
    }

    clearTheme() {
        this.state.theme.set("default")
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

    toggleMarket() {
        const current = get(this.state.marketOpen)
        this.state.marketOpen.set(!current)
    }

    getChat(conversationId: string): Chat | undefined {
        return get(this.state.chats).find(c => c.id === conversationId)
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
        if (get(page).route.id !== Route.Chat || get(MainStore.state.activeChat).id !== conversationId) {
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

    updateTypingIndicators(chat: Chat) {
        let update = chat.typing_indicator.size !== 0
        chat.typing_indicator.update()
        if (update) {
            this.state.chats.update(chats => chats.map(c => (c.id === chat.id ? { ...c, typing_indicator: chat.typing_indicator } : c)))

            MainStore.state.activeChat.update(c => {
                if (c.id === chat.id) {
                    return {
                        ...c,
                        typing_indicator: chat.typing_indicator,
                    }
                }
                return c
            })
            chat.typing_indicator.update()
        }
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

    getMostUsed(top = 6) {
        return derived(this.state.emojiCounter, counter => {
            return Object.entries(counter)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, top)
                .map(([emoji]) => emoji)
        })
    }
}

export const UIStore = new Store()
