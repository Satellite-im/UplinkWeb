import { EmojiFont, Font, Identicon, KeybindAction, KeybindState, Locale } from "$lib/enums"
import type { FontOption, Keybind } from "$lib/types"
import type { ISettingsState } from "."

export let defaultKeybinds: Keybind[] = [
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

export const availableFonts: FontOption[] = [
    { text: Font.Poppins, value: Font.Poppins },
    { text: Font.SpaceMono, value: Font.SpaceMono },
    { text: Font.ChakraPetch, value: Font.ChakraPetch },
    { text: Font.Comfortaa, value: Font.Comfortaa },
    { text: Font.Dosis, value: Font.Dosis },
    { text: Font.IBMPlexMono, value: Font.IBMPlexMono },
    { text: Font.PixelifySans, value: Font.PixelifySans },
    { text: Font.IndieFlower, value: Font.IndieFlower },
    { text: Font.JosefinSans, value: Font.JosefinSans },
    { text: Font.Noto, value: Font.Noto },
    { text: Font.SourceCodePro, value: Font.SourceCodePro },
    { text: Font.SpaceGrotesk, value: Font.SpaceGrotesk },
    { text: Font.MajorMono, value: Font.MajorMono },
    { text: Font.Merriweather, value: Font.Merriweather },
    { text: Font.PoiretOne, value: Font.PoiretOne },
    { text: Font.OpenDyslexic, value: Font.OpenDyslexic },
]

export const availableIdenticons: FontOption[] = [
    { text: Identicon.Avataaars, value: Identicon.Avataaars },
    { text: Identicon.AvataaarsNeutral, value: Identicon.AvataaarsNeutral },
    { text: Identicon.Bots, value: Identicon.Bots },
    { text: Identicon.BotsNeutral, value: Identicon.BotsNeutral },
    { text: Identicon.Icons, value: Identicon.Icons },
    { text: Identicon.Identicon, value: Identicon.Identicon },
    { text: Identicon.Lorelei, value: Identicon.Lorelei },
    { text: Identicon.Notionists, value: Identicon.Notionists },
    { text: Identicon.OpenPeeps, value: Identicon.OpenPeeps },
    { text: Identicon.PixelArt, value: Identicon.PixelArt },
    { text: Identicon.PixelArtNeutral, value: Identicon.PixelArtNeutral },
    { text: Identicon.Shapes, value: Identicon.Shapes },
]

export const availableEmoji: FontOption[] = [
    { text: EmojiFont.NotoEmoji.split(".")[0], value: EmojiFont.NotoEmoji },
    { text: EmojiFont.OpenMoji.split(".")[0], value: EmojiFont.OpenMoji },
    { text: EmojiFont.Blobmoji.split(".")[0], value: EmojiFont.Blobmoji },
    { text: EmojiFont.Twemoji.split(".")[0], value: EmojiFont.Twemoji },
    { text: EmojiFont.Fluent.split(".")[0], value: EmojiFont.Fluent },
]
export let defaultSettings: ISettingsState = {
    lang: Locale.EN_US,
    widgets: {
        show: false,
    },
    calling: {
        minimalCallingAlerts: false,
        echoCancellation: true,
        noiseSuppression: true,
        automaticGainControl: true,
        bitrate: 96000,
        sampleSize: 16,
        channels: 2,
    },
    messaging: {
        convertEmoji: true,
        markdownSupport: true,
        spamRejection: true,
        compact: false,
        quick: false,
        identiconStyle: Identicon.BotsNeutral,
        simpleUnreads: true,
    },
    audio: {
        inputDevice: "Default",
        outputDevice: "Default",
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
        enabled: true,
    },
    devmode: false,
}
