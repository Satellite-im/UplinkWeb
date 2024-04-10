import { Sound, Sounds } from "$lib/components/utils/Sounds"
import { Font, KeybindAction, Locale, MessageDirection, Status } from "$lib/enums"
import { mock_files } from "$lib/mock/files"
import { mock_messages } from "$lib/mock/messages"
import { blocked_users, mchats, mock_users } from "$lib/mock/users"
import { defaultUser, type Chat, type User, defaultChat, type Keybind, type Call, type FriendRequest, type FileInfo, hashChat, type Message, type MessageGroup } from "$lib/types"
import { get, writable, type Writable } from "svelte/store"
import { createPersistentState } from "./persistedState"
import { defaultSettings, type ISettingsState, type IState } from "./inital"


class GlobalStore {
    state: IState

    constructor() {
        this.state = {
            activeCall: writable(null),
            user: createPersistentState("uplink.user", defaultUser),
            activeChat: createPersistentState("uplink.activeChat", defaultChat),
            ui: {
                color: createPersistentState("uplink.color", "#4d4dff"),
                fontSize: createPersistentState("uplink.ui.fontSize", 1.0),
                font: createPersistentState("uplink.ui.font", Font.Poppins),
                cssOverride: createPersistentState("uplink.ui.cssOverride", ""),
                sidebarOpen: createPersistentState("uplink.ui.sidebarOpen", true),
                chats: createPersistentState("uplink.ui.chats", []),
            },
            settings: createPersistentState("uplink.settings", defaultSettings),
            devices: {
                input: createPersistentState("uplink.devices.input", "default"),
                output: createPersistentState("uplink.devices.output", "default"),
                muted: createPersistentState("uplink.devices.muted", false),
                deafened: createPersistentState("uplink.devices.deafened", false),
            },
            friends: createPersistentState("uplink.friends", []),
            blocked: createPersistentState("uplink.blocked", []),
            activeRequests: createPersistentState("uplink.requests", []),
            favorites: createPersistentState("uplink.favorites", []),
            files: createPersistentState("uplink.files", [])
        }
    }

    setUsername(name: string) {
        this.state.user.update(u => u = { ...u, name })
    }

    setStatus(message: string) {
        this.state.user.update(u => u = { ...u, profile: {
            ...u.profile,
            status_message: message
        } })
    }

    setActivityStatus(status: Status) {
        this.state.user.update(u => u = { ...u, profile: {
            ...u.profile,
            status: status
        } })
    }

    setPhoto(photo: string) {
        this.state.user.update(u => u = { ...u, profile: { ...u.profile, photo: { ...u.profile.photo, image: photo }}})
    }

    setBanner(photo: string) {
        this.state.user.update(u => u = { ...u, profile: { ...u.profile, banner: { ...u.profile.banner, image: photo }}})
    }

    setCssOverride(css: string) {
        this.state.ui.cssOverride.set(css)
    }

    setThemeColor(color: string) {
        this.state.ui.color.set(color)
    }

    setFont(font: Font) {
        this.state.ui.font.set(font)
    }

    setActiveChat(chat: Chat) {
        this.state.activeChat.set(chat)
        
        const chats = get(this.state.ui.chats)
        const chatIndex = chats.findIndex(c => c.id === chat.id)
    
        if (chatIndex !== -1) {
            const updatedChat = {...chats[chatIndex], notifications: 0}
            const updatedChats = [...chats]
            updatedChats[chatIndex] = updatedChat
            this.state.ui.chats.set(updatedChats)
        }
    }

    setActiveDM(user: User) {
        let chat = {
            ...defaultChat,
            id: "",
            users: [ user ],
            name: user.name,
            last_message_at: new Date(),
            motd: user.profile.status_message,
        }
        chat.id = hashChat(chat)
        this.setActiveChat(chat)
    }

    setInputDevice(device: string) {
        this.state.devices.input.set(device)
    }

    setOutputDevice(device: string) {
        this.state.devices.output.set(device)
    }

    updateSettings(settings: ISettingsState) {
        this.state.settings.set(settings)
    }

    increaseFontSize(amount: number = 0.025) {
        this.state.ui.fontSize.update((s) => (s + amount <= 1.5) ? s += amount : s)
    }

    decreaseFontSize(amount: number = 0.025) {
        this.state.ui.fontSize.update((s) => (s - amount >= 0.8) ? s -= amount : s)
    }

    updateMuted(muted: boolean) {
        this.state.devices.muted.set(muted)
        if (get(this.state.settings).audio.controlSounds)
            Sounds.play(muted ? Sound.Off : Sound.On)
    }

    updateDeafened(deafened: boolean) {
        this.state.devices.deafened.set(deafened)
        if (get(this.state.settings).audio.controlSounds)
            Sounds.play(deafened ? Sound.Off : Sound.On)
    }

    addFriend(user: User) {
        const currentFriends = get(this.state.friends)
        const currentRequests = get(this.state.activeRequests)
        if (!currentFriends.includes(user)) {
            this.state.friends.set([...currentFriends, user])
            this.state.activeRequests.set(
                currentRequests.filter(request => request.to.id !== user.id && request.from.id !== user.id)
            )
        }
    }

    acceptRequest(user: User) {
        const currentFriends = get(this.state.friends)
        const currentRequests = get(this.state.activeRequests)
    
        if (!currentFriends.some(friend => friend.id === user.id)) {
            this.state.friends.set([...currentFriends, user])
        }

        this.state.activeRequests.set(
            currentRequests.filter(request => request.to.id !== user.id && request.from.id !== user.id)
        )
    }

    denyRequest(user: User) {
        const currentRequests = get(this.state.activeRequests)        
        this.state.activeRequests.set(
            currentRequests.filter(request => request.to.id !== user.id && request.from.id !== user.id)
        )
    }

    cancelRequest(user: User) {
        this.denyRequest(user)
    }

    removeFriend(user: User) {
        let friendsList = get(this.state.friends)
        this.state.friends.set(friendsList.filter(f => f.id !== user.id))
    }

    blockUser(user: User) {
        this.removeFriend(user)
        this.state.blocked.set([...get(this.state.blocked), user])
    }

    unblockUser(user: User) {
        let blocked = get(this.state.blocked)
        this.state.blocked.set(blocked.filter(u => u.id !== user.id))
    }

    addFavorite(chat: Chat) {
        const currentFavorites = get(this.state.favorites)
        if (!currentFavorites.find(c => c.id === chat.id)) {
            this.state.favorites.set([...currentFavorites, chat])
        }
    }

    removeFavorite(chat: Chat) {
        this.state.favorites.set(
            get(this.state.favorites).filter(c => c.id !== chat.id)
        )
    }

    toggleFavorite(chat: Chat) {
        const currentFavorites = get(this.state.favorites)
        const isFavorite = currentFavorites.some(f => f.id === chat.id)
    
        this.state.favorites.set(
            isFavorite ? currentFavorites.filter(f => f.id !== chat.id) : [...currentFavorites, chat]
        )
    }

    isFavorite(chat: Chat): boolean {
        return get(this.state.favorites).some(f => f.id === chat.id)
    }

    openSidebar() {
        this.state.ui.sidebarOpen.set(true)
    }

    closeSidebar() {
        this.state.ui.sidebarOpen.set(false)
    }

    toggleSidebar() {
        const current = get(this.state.ui.sidebarOpen)
        this.state.ui.sidebarOpen.set(!current)
    }

    addSidebarChat(chat: Chat) {
        const currentchats = get(this.state.ui.chats)
        if (!currentchats.some(c => c.id === chat.id)) {
            this.state.ui.chats.set([...currentchats, chat])
        }
    }

    removeSidebarChat(chat: Chat) {
        this.state.ui.chats.set(
            get(this.state.ui.chats).filter(c => c.id !== chat.id)
        )
    }

    newMessage(chatId: string, newMessage: Message) {
        const chats = get(this.state.ui.chats)
        const chatIndex = chats.findIndex(chat => chat.id === chatId)

        if (chatIndex !== -1) {
            const updatedChat = {...chats[chatIndex]}
            const lastMessageGroup = updatedChat.conversation[updatedChat.conversation.length - 1]
            const now = new Date()

            // Check if the last message group was created less than a minute ago
            if (lastMessageGroup && (now.getTime() - new Date(lastMessageGroup.details.at).getTime()) < 60000) {
                lastMessageGroup.messages.push(newMessage)
            } else {
                // Create a new message group
                const newMessageGroup: MessageGroup = {
                    details: newMessage.details,
                    messages: [newMessage],
                }
                updatedChat.conversation.push(newMessageGroup)
            }

            // Update the chat in the state
            const updatedChats = [...chats]
            updatedChats[chatIndex] = updatedChat
            this.state.ui.chats.set(updatedChats)
        } else {
            console.error("Chat not found")
        }
    }

    get outboundRequests() {
        return get(this.state.activeRequests).filter((r: FriendRequest) => r.direction === MessageDirection.Outbound)
    }

    get inboundRequests() {
        return get(this.state.activeRequests).filter((r: FriendRequest) => r.direction === MessageDirection.Inbound)
    }

    get blockedUsers() {
        return get(this.state.blocked)
    }

    load_mock_data() {
        let mchatsMod = mchats
        let activeChat = mchatsMod[0]

        activeChat.conversation = mock_messages
        mchatsMod[0] = activeChat

        this.state.activeChat.set(mchatsMod[0])
        this.state.ui.chats.set(mchatsMod)
        this.state.files.set(mock_files)
        this.state.friends.set(mock_users)
        this.state.blocked.set(blocked_users)
        this.state.favorites.set([activeChat])
    }
}

export const Store = new GlobalStore()