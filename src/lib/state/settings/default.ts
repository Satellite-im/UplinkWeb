import { Identicon, KeybindAction, KeybindState, Locale } from "$lib/enums"
import type { Keybind } from "$lib/types"

export let defaultKeybinds = [
    {
        action: KeybindAction.IncreaseFontSize,
        key: ".",
        modifiers: ["shift", "ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.DecreaseFontSize,
        key: ",",
        modifiers: ["shift", "ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.ToggleMute,
        key: "M",
        modifiers: ["shift", "ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.ToggleDeafen,
        key: "D",
        modifiers: ["shift", "ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.OpenInspector,
        key: "I",
        modifiers: ["shift", "ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.ToggleDevmode,
        key: "~",
        modifiers: [],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.FocusUplink,
        key: "U",
        modifiers: ["shift", "ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.PushToTalk,
        key: ".",
        modifiers: [],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.PushToMute,
        key: ".",
        modifiers: ["ctrl"],
        state: KeybindState.Pressed,
    },
    {
        action: KeybindAction.PushToDeafen,
        key: ",",
        modifiers: [],
        state: KeybindState.Pressed,
    },
]

export let defaultSettings = {
    lang: Locale.EN_US,
    friends: [],
    favorites: [],
    activeRequests: [],
    blocked: [],
    files: [],
    widgets: {
        show: false,
    },
    messaging: {
        convertEmoji: true,
        markdownSupport: true,
        spamRejection: true,
        compact: false,
        quick: false,
        identiconStyle: Identicon.BotsNeutral
    },
    audio: {
        inputDevice: "Default",
        videoInputDevice: "Default",
        outputDevice: "Default",
        echoCancellation: true,
        interfaceSounds: false,
        controlSounds: true,
        messageSounds: true,
        callTimer: true,
    },
    extensions: {},
    keybinds: defaultKeybinds as Keybind[],
    accessibility: {
        openDyslexic: true,
    },
    notifications: {
        enabled: true,
        friends: true,
        messages: true,
        settings: true,
    },
    gamepad: {
        enabled: true
    },
    devmode: false,
}
