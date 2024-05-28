import { Sound, Sounds } from "$lib/components/utils/Sounds"
import { MessageDirection, Status } from "$lib/enums"
import { mock_files } from "$lib/mock/files"
import { mock_messages } from "$lib/mock/messages"
import { blocked_users, mchats, mock_users } from "$lib/mock/users"
import { defaultUser, type Chat, type User, defaultChat, type FriendRequest, hashChat, type Message, type MessageGroup, type FileInfo, type Frame } from "$lib/types"
import { get, writable } from "svelte/store"
import { type IState } from "./initial"
import { createPersistentState, SettingsStore } from "."
import { UIStore } from "./ui"

class GlobalStore {
    state: IState

    constructor() {
        this.state = {
            activeCall: writable(null),
            user: createPersistentState("uplink.user", defaultUser),
            activeChat: createPersistentState("uplink.activeChat", defaultChat),
            devices: {
                input: createPersistentState("uplink.devices.input", "default"),
                video: createPersistentState("uplink.devices.videoInput", "default"),
                output: createPersistentState("uplink.devices.output", "default"),
                muted: createPersistentState("uplink.devices.muted", false),
                deafened: createPersistentState("uplink.devices.deafened", false),
            },
            friends: createPersistentState("uplink.friends", []),
            blocked: createPersistentState("uplink.blocked", []),
            activeRequests: createPersistentState("uplink.requests", []),
            favorites: createPersistentState("uplink.favorites", []),
            files: createPersistentState("uplink.files", []),
        }
    }

    setUsername(name: string) {
        this.state.user.update(u => (u = { ...u, name }))
    }

    setStatusMessage(message: string) {
        this.state.user.update(
            u =>
            (u = {
                ...u,
                profile: {
                    ...u.profile,
                    status_message: message,
                },
            })
        )
    }

    setActivityStatus(status: Status) {
        this.state.user.update(
            u =>
            (u = {
                ...u,
                profile: {
                    ...u.profile,
                    status: status,
                },
            })
        )
    }

    setPhoto(photo: string) {
        this.state.user.update(u => (u = { ...u, profile: { ...u.profile, photo: { ...u.profile.photo, image: photo } } }))
    }

    setFrame(frame: Frame) {
        this.state.user.update(u => (u = { ...u, profile: { ...u.profile, photo: { ...u.profile.photo, frame } } }))
    }

    unequipFrame() {
        this.state.user.update(u => (u = { ...u, profile: { ...u.profile, photo: { ...u.profile.photo, frame: { name: "", image: "" } } } }))
    }

    setBanner(photo: string) {
        this.state.user.update(u => (u = { ...u, profile: { ...u.profile, banner: { ...u.profile.banner, image: photo } } }))
    }

    setActiveChat(chat: Chat) {
        this.state.activeChat.set(chat)

        const chats = get(UIStore.state.chats)
        const chatIndex = chats.findIndex(c => c.id === chat.id)

        if (chatIndex !== -1) {
            const updatedChat = { ...chats[chatIndex], notifications: 0 }
            const updatedChats = [...chats]
            updatedChats[chatIndex] = updatedChat
            UIStore.state.chats.set(updatedChats)
        }

        UIStore.addSidebarChat(chat)
    }

    setActiveDM(user: User) {
        let chat = {
            ...defaultChat,
            id: "",
            users: [user],
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

    setVideoInputDevice(device: string) {
        this.state.devices.video.set(device)
    }

    setOutputDevice(device: string) {
        this.state.devices.output.set(device)
    }

    updateMuted(muted: boolean) {
        this.state.devices.muted.set(muted)
        if (get(SettingsStore.state).audio.controlSounds) Sounds.play(muted ? Sound.Off : Sound.On)
    }

    updateDeafened(deafened: boolean) {
        this.state.devices.deafened.set(deafened)
        if (get(SettingsStore.state).audio.controlSounds) Sounds.play(deafened ? Sound.Off : Sound.On)
    }

    updateFileOrder(newOrder: FileInfo[]) {
        this.state.files.set(newOrder)
    }

    addFriend(user: User) {
        const currentFriends = get(this.state.friends)
        const currentRequests = get(this.state.activeRequests)
        if (!currentFriends.includes(user)) {
            this.state.friends.set([...currentFriends, user])
            this.state.activeRequests.set(currentRequests.filter(request => request.to.id !== user.id && request.from.id !== user.id))
        }
    }

    acceptRequest(user: User) {
        const currentFriends = get(this.state.friends)
        const currentRequests = get(this.state.activeRequests)

        if (!currentFriends.some(friend => friend.id === user.id)) {
            this.state.friends.set([...currentFriends, user])
        }

        this.state.activeRequests.set(currentRequests.filter(request => request.to.id !== user.id && request.from.id !== user.id))
    }

    denyRequest(user: User) {
        const currentRequests = get(this.state.activeRequests)
        this.state.activeRequests.set(currentRequests.filter(request => request.to.id !== user.id && request.from.id !== user.id))
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
        this.state.favorites.set(get(this.state.favorites).filter(c => c.id !== chat.id))
    }

    toggleFavorite(chat: Chat) {
        const currentFavorites = get(this.state.favorites)
        const isFavorite = currentFavorites.some(f => f.id === chat.id)

        this.state.favorites.set(isFavorite ? currentFavorites.filter(f => f.id !== chat.id) : [...currentFavorites, chat])
    }

    isFavorite(chat: Chat): boolean {
        return get(this.state.favorites).some(f => f.id === chat.id)
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

    loadMockData() {
        let mchatsMod = mchats
        let activeChat = mchatsMod[0]

        mchatsMod[0] = activeChat

        this.state.activeChat.set(mchatsMod[0])
        UIStore.state.chats.set(mchatsMod)
        this.state.files.set(mock_files)
        this.state.friends.set(mock_users)
        this.state.blocked.set(blocked_users)
        this.state.favorites.set([activeChat])
    }
}

export const Store = new GlobalStore()
