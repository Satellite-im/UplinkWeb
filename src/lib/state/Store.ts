import { Sound, Sounds } from "$lib/components/utils/Sounds"
import { ChatType, MessageDirection, Status } from "$lib/enums"
import { mock_files } from "$lib/mock/files"
import { mock_messages } from "$lib/mock/messages"
import { blocked_users, mchats, mock_users } from "$lib/mock/users"
import { defaultUser, type Chat, type User, defaultChat, type FriendRequest, hashChat, type Message, type MessageGroup, type FileInfo, type Frame } from "$lib/types"
import { get, writable } from "svelte/store"
import { type IState } from "./initial"
import { createPersistentState, SettingsStore } from "."
import { UIStore } from "./ui"
import * as wasm from "warp-wasm"
import { ToastMessage } from "./ui/toast"
import { v4 as uuidv4 } from "uuid"
import { Logger } from "$lib/utils/Logger"
import { ConversationStore } from "./conversation"

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
            openFolders: createPersistentState<Record<string, boolean>>("uplink.openFolders", {}),
            toasts: createPersistentState("uplink.toasts", {}),
        }
    }

    setUserFromIdentity(identity: wasm.Identity) {
        let userFromIdentity: User = {
            ...defaultUser,
            id: { short: identity.short_id() },
            name: identity.username(),
            key: identity.did_key(),
            profile: {
                ...defaultUser.profile,
                status: Status.Online,
                status_message: identity.status_message() || "",
            },
        }
        this.state.user.update(u => (u = userFromIdentity))
    }

    updateOwnIdentity(identity: User) {
        this.state.user.set(identity)
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

    getChatForUser(userID: string) {
        const chats = get(UIStore.state.chats)
        return chats.find(c => c.kind == ChatType.DirectMessage && c.users.find(u => u.key === userID))
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

    clearActiveChat() {
        this.state.activeChat.set(defaultChat)
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
    updateFolderTree(newFolderTree: Record<string, boolean>) {
        this.state.openFolders.set(newFolderTree)
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

    setFriends(friends: Array<any>) {
        let friendsList: Array<User> = []
        friends.forEach(friend => {
            friendsList.push({
                ...defaultUser,
                name: friend,
                key: friend,
            })
        })

        this.state.friends.set(friendsList)
    }

    setFriendRequests(incomingFriendRequests: Array<any>, outgoingFriendRequests: Array<any>) {
        let user = get(this.state.user)

        const createFriendRequests = (friendRequests: Array<any>, direction: MessageDirection): FriendRequest[] => {
            return friendRequests.map(friendDid => {
                let friendUser: User = {
                    ...defaultUser,
                    name: friendDid,
                    key: friendDid,
                }
                return {
                    at: new Date(),
                    from: direction === MessageDirection.Inbound ? friendUser : user,
                    to: direction === MessageDirection.Inbound ? user : friendUser,
                    direction: direction,
                }
            })
        }

        let incomingRequests = createFriendRequests(incomingFriendRequests, MessageDirection.Inbound)
        let outgoingRequests = createFriendRequests(outgoingFriendRequests, MessageDirection.Outbound)

        let allFriendRequests = new Set([...incomingRequests, ...outgoingRequests])

        this.state.activeRequests.set(Array.from(allFriendRequests.values()))
    }

    setBlockedUsers(blockedUsers: Array<any>) {
        let blockedUsersList: Array<User> = []
        blockedUsers.forEach(blockedUser => {
            blockedUsersList.push({
                ...defaultUser,
                name: blockedUser,
                key: blockedUser,
            })
        })
        this.state.blocked.set(blockedUsersList)
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

    addToastNotification(toast: ToastMessage) {
        let toasts = get(this.state.toasts)
        let id = uuidv4()
        let timeout = setTimeout(() => {
            this.removeToast(id)
        }, toast.remaining_time * 1000)
        this.state.toasts.set({ ...toasts, [id]: [toast, timeout] })
    }

    pauseToastTimeout(id: string) {
        let toasts = get(this.state.toasts)
        if (id in toasts) {
            clearTimeout(toasts[id][1])
        }
    }

    resumeToastTimeout(id: string) {
        let toasts = get(this.state.toasts)
        if (id in toasts) {
            let toast = toasts[id][0]
            let timeout = setTimeout(() => {
                this.removeToast(id)
            }, toast.remaining_time * 1000)
            this.state.toasts.set({ ...toasts, [id]: [toast, timeout] })
        }
    }

    removeToast(id: string) {
        this.state.toasts.update(toasts => {
            delete toasts[id]
            return toasts
        })
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
        ConversationStore.conversations.set(
            mchatsMod.map(c => {
                return {
                    id: c.id,
                    messages: [],
                }
            })
        )
    }
}

export const Store = new GlobalStore()
