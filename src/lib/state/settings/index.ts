import type { Keybind } from "$lib/types"
import type { Locale } from "javascript-time-ago"
import { get, type Writable } from "svelte/store"
import { createPersistentState, defaultSettings } from ".."
import type { Identicon } from "$lib/enums"

export interface ISettingsState {
    lang: Locale
    widgets: {
        show: boolean
    }
    messaging: {
        convertEmoji: boolean
        markdownSupport: boolean
        spamRejection: boolean
        compact: boolean
        quick: boolean
        identiconStyle: Identicon
        simpleUnreads: boolean
    }
    audio: {
        inputDevice: string
        outputDevice: string
        interfaceSounds: boolean
        controlSounds: boolean
        messageSounds: boolean
        callTimer: boolean
    }
    calling: {
        minimalCallingAlerts: boolean
        echoCancellation: boolean
        noiseSuppression: boolean
        automaticGainControl: boolean
        bitrate: number
        sampleSize: number
        channels: number
    }
    extensions: {}
    keybinds: Keybind[]
    accessibility: {
        openDyslexic: boolean
    }
    notifications: {
        enabled: boolean
        friends: boolean
        messages: boolean
        settings: boolean
    }
    gamepad: {
        enabled: boolean
    }
    devmode: boolean
}

export { defaultKeybinds, defaultSettings } from "./default"

class Store {
    state: Writable<ISettingsState>

    constructor() {
        this.state = createPersistentState("uplink.settings", defaultSettings)
    }

    update(settings: ISettingsState) {
        this.state.set(settings)
    }

    setEchoCancellation(state: boolean) {
        this.state.update(s => ({ ...s, calling: { ...s.calling, echoCancellation: state } }))
    }

    setNoiseSuppression(state: boolean) {
        this.state.update(s => ({ ...s, calling: { ...s.calling, noiseSuppression: state } }))
    }

    setAutomaticGainControl(state: boolean) {
        this.state.update(s => ({ ...s, calling: { ...s.calling, automaticGainControl: state } }))
    }

    setBitrate(bitrate: number) {
        this.state.update(s => ({ ...s, calling: { ...s.calling, bitrate } }))
    }

    setSampleSize(sampleSize: number) {
        this.state.update(s => ({ ...s, calling: { ...s.calling, sampleSize } }))
    }

    setChannels(channels: number) {
        this.state.update(s => ({ ...s, calling: { ...s.calling, channels } }))
    }

    toggleDevmode(state: boolean) {
        this.state.set({ ...get(this.state), devmode: state })
    }
}

export const SettingsStore = new Store()
