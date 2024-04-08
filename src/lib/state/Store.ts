import { Sound, Sounds } from "$lib/components/utils/Sounds"
import { Font, KeybindAction, Locale, MessageDirection, Status } from "$lib/enums"
import { mock_users } from "$lib/mock/users"
import { defaultUser, type Chat, type User, defaultChat, type Keybind, type Call, type FriendRequest } from "$lib/types"
import { get, writable, type Writable } from "svelte/store"

export interface ISettingsState {
    lang: Locale,
    messaging: {
        convertEmoji: boolean,
        markdownSupport: boolean,
        spamRejection: boolean,
    },
    audio: {
        inputDevice: string,
        outputDevice: string,
        echoCancellation: boolean,
        interfaceSounds: boolean,
        controlSounds: boolean,
        messageSounds: boolean,
        callTimer: boolean,
    },
    extensions: {},
    keybinds: Keybind[],
    accessability: {
        openDyslexic: boolean,
    },
    notifications: {
        enabled: boolean,
        friends: boolean,
        messages: boolean,
        settings: boolean,
    }
}

export let defaultKeybinds = [
    {
        action: KeybindAction.IncreaseFontSize,
        key: ".",
        modifiers: ["shift", "ctrl"]
    },
    {
        action: KeybindAction.DecreaseFontSize,
        key: ",",
        modifiers: ["shift", "ctrl"]
    },
    {
        action: KeybindAction.ToggleMute,
        key: "M",
        modifiers: ["shift", "ctrl"]
    },
    {
        action: KeybindAction.ToggleDeafen,
        key: "D",
        modifiers: ["shift", "ctrl"]
    },
    {
        action: KeybindAction.OpenInspector,
        key: "I",
        modifiers: ["shift", "ctrl"]
    },
    {
        action: KeybindAction.ToggleDevmode,
        key: "~",
        modifiers: []
    },
    {
        action: KeybindAction.FocusUplink,
        key: "U",
        modifiers: ["shift", "ctrl"]
    }
]

export let defaultSettings = {
    lang: Locale.EN_US,
    friends: [],
    activeRequests: [],
    blocked: [],
    messaging: {
        convertEmoji: true,
        markdownSupport: true,
        spamRejection: true,
    },
    audio: {
        inputDevice: "Default",
        outputDevice: "Default",
        echoCancellation: true,
        interfaceSounds: false,
        controlSounds: true,
        messageSounds: true,
        callTimer: true,
    },
    extensions: {},
    keybinds: defaultKeybinds,
    accessability: {
        openDyslexic: true,
    },
    notifications: {
        enabled: true,
        friends: true,
        messages: true,
        settings: true,
    }
}

export interface IState {
    user: Writable<User>,
    blocked: Writable<User[]>,
    activeRequests: Writable<FriendRequest[]>,
    friends: Writable<User[]>,
    devices: {
        muted: Writable<boolean>,
        deafened: Writable<boolean>,
        input: Writable<string>,
        output: Writable<string>,
    },
    activeChat: Writable<Chat>,
    activeCall: Writable<Call>,
    ui: {
        color: Writable<string>,
        fontSize: Writable<number>,
        cssOverride: Writable<string>,
        font: Writable<Font>
    },
    settings: Writable<ISettingsState>
}

function getLSItem(key: string, fallback: any) {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
}

function setLSItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
}

const user = writable(getLSItem("uplink.user", defaultUser) as User)
user.subscribe(user => setLSItem("uplink.user", user))

const activeChat = writable(getLSItem("uplink.activeChat", defaultChat))
activeChat.subscribe(chat => setLSItem("uplink.activeChat", chat))

const color = writable(getLSItem("uplink.ui.color", "#4d4dff"))
color.subscribe(c => setLSItem("uplink.ui.color", c))

const fontSize = writable(getLSItem("uplink.ui.fontSize", 1.0))
fontSize.subscribe(size => setLSItem("uplink.ui.fontSize", size))

const font = writable(getLSItem("uplink.ui.font", Font.Poppins))
font.subscribe(f => setLSItem("uplink.ui.font", f))

const cssOverride = writable(getLSItem("uplink.ui.cssOverride", ""))
cssOverride.subscribe(css => setLSItem("uplink.ui.cssOverride", css))

const settings = writable(getLSItem("uplink.settings", defaultSettings))
settings.subscribe(s => setLSItem("uplink.settings", s))

const inputDevice = writable(getLSItem("uplink.devices.input", "default"))
inputDevice.subscribe(d => setLSItem("uplink.devices.input", d))

const outputDevice = writable(getLSItem("uplink.devices.output", "default"))
outputDevice.subscribe(d => setLSItem("uplink.devices.output", d))

const muted = writable(getLSItem("uplink.devices.muted", false))
muted.subscribe(status => setLSItem("uplink.devices.muted", status))

const friends = writable(getLSItem("uplink.friends", mock_users))
friends.subscribe(f => setLSItem("uplink.friends", f))

const blocked = writable(getLSItem("uplink.blocked", []))
blocked.subscribe(f => setLSItem("uplink.blocked", f))

const activeRequests = writable(getLSItem("uplink.requests", []))
activeRequests.subscribe(f => setLSItem("uplink.requests", f))

const initialState: IState = {
    user,
    friends,
    blocked,
    activeRequests,
    devices: {
        muted,
        deafened: writable(false),
        input: inputDevice,
        output: outputDevice
    },
    activeChat,
    activeCall: writable({
        startedAt: new Date(),
        inCall: false,
        chat: defaultChat
    }),
    ui: {
        color,
        fontSize,
        font,
        cssOverride
    },
    settings
}

class GlobalStore {
    state: IState

    constructor(state: IState) {
        this.state = {...state}
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
    }

    setActiveDM(user: User) {
        this.state.activeChat.set({
            ...defaultChat,
            users: [ user ],
            name: user.name,
            motd: user.profile.status_message
        })
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

    get outboundRequests() {
        return get(this.state.activeRequests).filter((r: FriendRequest) => r.direction === MessageDirection.Outbound)
    }

    get inboundRequests() {
        return get(this.state.activeRequests).filter((r: FriendRequest) => r.direction === MessageDirection.Inbound)
    }

    get blockedUsers() {
        return get(this.state.blocked)
    }
}

export const Store = new GlobalStore(initialState);
