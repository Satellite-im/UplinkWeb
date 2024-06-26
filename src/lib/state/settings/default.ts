import { KeybindAction, Locale } from "$lib/enums"
import type { Keybind } from "$lib/types"

export let defaultKeybinds = [
    {
        action: KeybindAction.IncreaseFontSize,
        key: ".",
        modifiers: ["shift", "ctrl"],
    },
    {
        action: KeybindAction.DecreaseFontSize,
        key: ",",
        modifiers: ["shift", "ctrl"],
    },
    {
        action: KeybindAction.ToggleMute,
        key: "M",
        modifiers: ["shift", "ctrl"],
    },
    {
        action: KeybindAction.ToggleDeafen,
        key: "D",
        modifiers: ["shift", "ctrl"],
    },
    {
        action: KeybindAction.OpenInspector,
        key: "I",
        modifiers: ["shift", "ctrl"],
    },
    {
        action: KeybindAction.ToggleDevmode,
        key: "~",
        modifiers: [],
    },
    {
        action: KeybindAction.FocusUplink,
        key: "U",
        modifiers: ["shift", "ctrl"],
    },
    {
        action: KeybindAction.PushToTalk,
        key: ".",
        modifiers: [],
    },
    {
        action: KeybindAction.PushToMute,
        key: ".",
        modifiers: ["ctrl"],
    },
    {
        action: KeybindAction.PushToDeafen,
        key: ",",
        modifiers: [],
    },
]

export let defaultSettings = {
    lang: Locale.EN_US,
    friends: [],
    favorites: [],
    activeRequests: [],
    blocked: [],
    files: [],
    messaging: {
        convertEmoji: true,
        markdownSupport: true,
        spamRejection: true,
        compact: false,
        quick: false,
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
    devmode: false,
}
