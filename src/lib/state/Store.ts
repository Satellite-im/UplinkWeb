import { CallDirection, ChatType, MessageDirection, Status } from "$lib/enums"
import { mock_files } from "$lib/mock/files"
import { blocked_users, mchats, mock_users } from "$lib/mock/users"
import { defaultUser, type Chat, type User, defaultChat, type FriendRequest, hashChat, type Message, type MessageGroup, type FileInfo, type Frame, type Integration, TypingIndicator } from "$lib/types"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import { type IState } from "./initial"
import { createPersistentState, SettingsStore } from "."
import { UIStore } from "./ui"
import * as wasm from "warp-wasm"
import { ToastMessage } from "./ui/toast"
import { v4 as uuidv4 } from "uuid"
import { ConversationStore } from "./conversation"
import { playSound, Sounds } from "$lib/components/utils/SoundHandler"
import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"

class GlobalStore {
    state: IState

    constructor() {
        this.state = {
            activeCall: writable(null),
            pendingCall: writable(null),
            user: createPersistentState("uplink.user", defaultUser),
            activeChat: createPersistentState("uplink.activeChat", defaultChat, {
                deserializer: (chat: Chat) => {
                    chat.typing_indicator = new TypingIndicator()
                    return chat
                },
            }),
            activeCallMeta: writable({}),
            chatMessagesToSend: createPersistentState("uplink.chatMessagesToSend", {}),
            chatAttachmentsToSend: createPersistentState("uplink.chatAttachmentsToSend", {}),
            devices: {
                input: createPersistentState("uplink.devices.input", "default"),
                video: createPersistentState("uplink.devices.videoInput", "default"),
                cameraEnabled: createPersistentState("uplink.devices.cameraEnabled", false),
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
            toasts: writable({}),
            userCache: writable({}),
            pageState: writable(""),
        }
    }

    setUserFromIdentity(identity: wasm.Identity, photo?: string, banner?: string) {
        let userFromIdentity: User = {
            ...defaultUser,
            id: { short: identity.short_id() },
            name: identity.username(),
            key: identity.did_key(),
            profile: {
                ...defaultUser.profile,
                photo: { ...defaultUser.profile.photo, image: photo ? photo : "" },
                banner: { ...defaultUser.profile.banner, image: banner ? banner : "" },
                status: Status.Online,
                status_message: identity.status_message() || "",
            },
            integrations: identity.metadata(),
        }
        this.state.user.update(u => (u = userFromIdentity))
    }

    updateOwnIdentity(identity: User) {
        this.state.user.set(identity)
    }

    setUsername(name: string) {
        this.state.user.update(u => (u = { ...u, name }))
    }

    setIntegrations(integrations: Map<string, string>) {
        this.state.user.update(u => (u = { ...u, integrations }))
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
        let chat = chats.find(c => c.kind == ChatType.DirectMessage && c.users.find(u => u === userID))
        if (chat) {
            return chat
        } else {
            let hiddenChats = get(UIStore.state.hiddenChats)
            let hiddenChat = hiddenChats.find(c => c.kind == ChatType.DirectMessage && c.users.find(u => u === userID))
            if (hiddenChat) {
                UIStore.addSidebarChat(hiddenChat)
                UIStore.state.hiddenChats.set(hiddenChats.filter(c => c.id !== hiddenChat.id))
                return hiddenChat
            }
            return undefined
        }
    }

    getCallingChat(chatID: string) {
        const chats = get(UIStore.state.chats)
        return chats.find(c => c.id === chatID)
    }

    setActiveChatByID(chatID: string): Chat | undefined {
        const chats = get(UIStore.state.chats)
        const chat = chats.find(c => c.id === chatID)
        if (chat) {
            this.setActiveChat(chat)
        }
        return chat
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

    updateCameraEnabled(enabled: boolean) {
        this.state.devices.cameraEnabled.set(enabled)
        if (get(SettingsStore.state).audio.controlSounds) playSound(enabled ? Sounds.Off : Sounds.On)
    }

    updateMuted(muted: boolean) {
        this.state.devices.muted.set(muted)
        if (get(SettingsStore.state).audio.controlSounds) playSound(muted ? Sounds.Off : Sounds.On)
    }

    updateDeafened(deafened: boolean) {
        this.state.devices.deafened.set(deafened)
        this.state.devices.muted.set(deafened)
        if (get(SettingsStore.state).audio.controlSounds) playSound(deafened ? Sounds.Off : Sounds.On)
    }

    updateFileOrder(newOrder: FileInfo[]) {
        this.state.files.set(newOrder)
    }
    updateFolderTree(newFolderTree: Record<string, boolean>) {
        this.state.openFolders.set(newFolderTree)
    }

    setPendingCall(chat: Chat, direction: CallDirection) {
        this.state.pendingCall.set({
            chat: chat,
            startedAt: new Date(),
            inCall: true,
            direction,
            volumeParticipantsLevel: {},
        })
    }

    setActiveCall(chat: Chat, direction: CallDirection = CallDirection.Inbound) {
        this.state.activeCall.set({
            chat: chat,
            startedAt: new Date(),
            inCall: true,
            direction,
            volumeParticipantsLevel: {},
        })
    }

    acceptCall() {
        this.state.activeCall.update(call => {
            if (call) {
                call.inCall = true
                return call
            }
            return call
        })
        this.state.pendingCall.set(null)
    }

    denyCall() {
        this.state.pendingCall.set(null)
    }

    endCall() {
        this.state.activeCall.set(null)
    }

    addFriend(user: string) {
        const currentFriends = get(this.state.friends)
        const currentRequests = get(this.state.activeRequests)
        if (!currentFriends.includes(user)) {
            this.state.friends.set([...currentFriends, user])
            this.state.activeRequests.set(currentRequests.filter(request => request.to !== user && request.from !== user))
        }
    }

    acceptRequest(user: string) {
        const currentFriends = get(this.state.friends)
        const currentRequests = get(this.state.activeRequests)

        if (!currentFriends.some(friend => friend === user)) {
            this.state.friends.set([...currentFriends, user])
        }

        this.state.activeRequests.set(currentRequests.filter(request => request.to !== user && request.from !== user))
    }

    denyRequest(user: string) {
        const currentRequests = get(this.state.activeRequests)
        this.state.activeRequests.set(currentRequests.filter(request => request.to !== user && request.from !== user))
    }

    setFriends(friends: Array<string>) {
        this.state.friends.set(friends)
    }

    setFriendRequests(incomingFriendRequests: Array<FriendRequest>, outgoingFriendRequests: Array<FriendRequest>) {
        let allFriendRequests = new Set([...incomingFriendRequests, ...outgoingFriendRequests])

        this.state.activeRequests.set(Array.from(allFriendRequests.values()))
    }

    setBlockedUsers(blockedUsers: Array<string>) {
        this.state.blocked.set(blockedUsers)
    }

    cancelRequest(user: string) {
        this.denyRequest(user)
    }
    removeFriend(user: string) {
        let friendsList = get(this.state.friends)
        let chatToRemove: Chat | undefined
        this.state.friends.set(friendsList.filter(f => f !== user))

        this.state.favorites.update(favoriteChats => {
            return favoriteChats.filter(c => !c.users.includes(user))
        })

        UIStore.state.chats.update(chats => {
            chatToRemove = chats.find(c => c.users.includes(user) && c.kind === ChatType.DirectMessage)
            return chats.filter(c => (!c.users.includes(user) && c.kind === ChatType.DirectMessage) || c.kind === ChatType.Group)
        })
        this.state.activeChat.set(defaultChat)
        if (chatToRemove) {
            RaygunStoreInstance.delete(chatToRemove.id)
        }
    }
    blockUser(user: string) {
        this.removeFriend(user)
        this.state.blocked.set([...get(this.state.blocked), user])
    }

    unblockUser(user: string) {
        let blocked = get(this.state.blocked)
        this.state.blocked.set(blocked.filter(u => u !== user))
    }

    /**
     * Looksup the user in the cache. Fetching it from Multipass if not present.
     * It returns a Readable so using it in a svelte component will automatically update the component whenever the data changes
     * Example usage:
     * $: user = Store.getUser(did)
     * let name = $user.name
     * @param did The did of the user to lookup
     * @returns The looked up user in the cache
     */
    getUser(did: string): Writable<User> {
        // Handle special cases like mock data or default user
        if (did === defaultUser.key) return writable(defaultUser)
        let mock = mock_users.find(user => user.key === did)
        if (mock) return writable(mock)
        // If its the own user return the own instance
        if (did === get(this.state.user).key) return this.state.user
        let cache = get(this.state.userCache)
        let cached: Writable<User> = cache[did]
        if (!cached) {
            // The user is not in the cache so we fetch it from Multipass
            // For that we return the default user that then gets updated with the result from Multipass
            let create: Writable<User> = writable({
                ...defaultUser,
                loading: true,
            })
            MultipassStoreInstance.identity_from_did(did)
                .then(fetched => {
                    if (fetched) {
                        create.set(fetched)
                    } else create.set({ ...get(create), loading: false })
                })
                .catch(_ => create.set({ ...get(create), loading: false }))
            cache[did] = create
            this.state.userCache.set(cache)
            return create
        }
        return cached
    }

    /**
     * Returns a view of users with the given dids
     * The view automatically updates whenever the data of the user in the cache changes
     * @param dids A list if dids to lookup
     * @returns The users matching the given dids
     */
    getUsers(dids: string[] | Readable<string[]>): Readable<User[]> {
        // Check the type of the input
        let check = (val: string[] | Readable<string[]>): val is Readable<string[]> => (<Readable<string[]>>dids).subscribe !== undefined
        if (check(dids)) {
            return derived(dids, ($resolved, set) => {
                let users = derived(
                    $resolved.map(did => this.getUser(did)),
                    users => users
                )
                return users.subscribe(value => set(value))
            })
        }
        return derived(
            dids.map(did => this.getUser(did)),
            users => users
        )
    }

    /**
     * Returns a subset of a user lookup with the given dids. This subset auto updates whenever the cache in Store updates
     * @param dids A list if dids to lookup
     * @returns The map of did -> User
     */
    getUsersLookup(dids: string[] | Readable<string[]>): Readable<{ [key: string]: User }> {
        return derived(this.getUsers(dids), result => {
            return result.reduce<{ [key: string]: User }>((acc, obj) => {
                acc[obj.key] = obj
                return acc
            }, {})
        })
    }

    /**
     * Updates the usercache with the given user
     */
    updateUser(user: User) {
        if (user.key === get(this.state.user).key) return
        let cache = get(this.state.userCache)
        let cached: Writable<User> = cache[user.key]
        if (!cached) {
            cache[user.key] = writable(user)
        } else {
            cached.set(user)
        }
        this.state.userCache.set(cache)
    }

    addFavorite(chat: Chat) {
        const currentFavorites = get(this.state.favorites)
        if (!currentFavorites.find(c => c.id === chat.id)) {
            this.state.favorites.set([...currentFavorites, chat])
        }
    }

    addToastNotification(toast: ToastMessage, sound?: Sounds) {
        let toasts = get(this.state.toasts)
        let id = uuidv4()
        let timeout = setTimeout(() => {
            this.removeToast(id)
        }, toast.remaining_time * 1000)
        this.state.toasts.set({ ...toasts, [id]: [toast, timeout] })
        if (sound) {
            playSound(sound)
        }
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

    outboundRequests(requests: FriendRequest[]) {
        return requests.filter((r: FriendRequest) => r.direction === MessageDirection.Outbound)
    }

    inboundRequests(requests: FriendRequest[]) {
        return requests.filter((r: FriendRequest) => r.direction === MessageDirection.Inbound)
    }

    get blockedUsers() {
        return get(this.state.blocked)
    }

    startMockCall() {
        let chat = defaultChat
        this.setPendingCall(chat, CallDirection.Inbound)
    }

    loadMockData() {
        let mchatsMod = mchats
        let activeChat = mchatsMod[0]

        mchatsMod[0] = activeChat

        this.state.activeChat.set(mchatsMod[0])
        UIStore.state.chats.set(mchatsMod)
        this.state.files.set(mock_files)
        this.state.friends.set(mock_users.map(u => u.key))
        this.state.blocked.set(blocked_users.map(u => u.key))
        this.state.favorites.set([activeChat])
        ConversationStore.addConversations(mchatsMod.map(c => c.id))
    }
}

export const Store = new GlobalStore()
