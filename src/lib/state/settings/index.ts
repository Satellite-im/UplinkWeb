import type { Keybind } from "$lib/types"
import type { Locale } from "javascript-time-ago"
import type { Writable } from "svelte/store"
import { createPersistentState, defaultSettings } from ".."

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

export { defaultKeybinds, defaultSettings} from "./default"

class Store {
    state: Writable<ISettingsState>

    constructor() {
        this.state = createPersistentState("uplink.settings", defaultSettings)
    }

    update(settings: ISettingsState) {
        this.state.set(settings)
    }
}

export const SettingsStore = new Store()