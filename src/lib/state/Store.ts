import { KeybindAction, Locale, Status } from "$lib/enums"
import { defaultUser, type Chat, type User, defaultChat, type Keybind } from "$lib/types"
import { writable, type Invalidator, type Subscriber, type Unsubscriber, type Updater, type Writable } from "svelte/store"

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

export let defaultSettings = {
    lang: Locale.EN_US,
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
    keybinds: [
        {
            action: KeybindAction.IncreaseFontSize,
            keys: ["Ctrl", "Shift", "+"]
        },
        {
            action: KeybindAction.DecreaseFontSize,
            keys: ["Ctrl", "Shift", "-"]
        },
        {
            action: KeybindAction.ToggleMute,
            keys: ["Ctrl", "Shift", "M"]
        },
        {
            action: KeybindAction.ToggleDeafen,
            keys: ["Ctrl", "Shift", "D"]
        },
        {
            action: KeybindAction.OpenInspector,
            keys: ["Ctrl", "Shift", "I"]
        },
        {
            action: KeybindAction.ToggleDevmode,
            keys: ["Ctrl", "Shift", "D"]
        },
        {
            action: KeybindAction.FocusUplink,
            keys: ["Ctrl", "Shift", "U"]
        }
    ],
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
    devices: {
        muted: Writable<boolean>,
        deafened: Writable<boolean>,
    },
    activeChat: Writable<Chat>,
    ui: {
        color: Writable<string>,
        fontSize: Writable<number>,
        cssOverride: Writable<string>
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

const cssOverride = writable(getLSItem("uplink.ui.cssOverride", ""))
cssOverride.subscribe(css => setLSItem("uplink.ui.cssOverride", css))

const settings = writable(getLSItem("uplink.settings", ""))
settings.subscribe(s => setLSItem("uplink.settings", s))

const initialState: IState = {
    user,
    devices: {
        muted: writable(false),
        deafened: writable(false),
    },
    activeChat,
    ui: {
        color,
        fontSize,
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

    setActiveChat(chat: Chat) {
        this.state.activeChat.set(chat)
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
}

export const Store = new GlobalStore(initialState);
