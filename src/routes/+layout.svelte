<script lang="ts">
    import { page } from "$app/stores"
    import { Toasts } from "$lib/components"
    import IncomingCall from "$lib/components/calling/IncomingCall.svelte"
    import Polling from "$lib/components/Polling.svelte"
    import GamepadListener from "$lib/components/ui/GamepadListener.svelte"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { playSound, Sounds } from "$lib/components/utils/SoundHandler"
    import { EmojiFont, Font, KeybindAction, KeybindState, Route, Theme } from "$lib/enums"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { SettingsStore } from "$lib/state"
    import { checkIfUserIsLogged } from "$lib/state/auth"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import type { Keybind } from "$lib/types"
    import { log } from "$lib/utils/Logger"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import "/src/app.scss"
    import TimeAgo from "javascript-time-ago"
    import en from "javascript-time-ago/locale/en"
    import { onMount } from "svelte"
    import { get } from "svelte/store"
    import { _, locale } from "svelte-i18n"
    import { initializeLocale } from "$lib/lang/index"
    import CircularProgressIndicator from "$lib/components/loading/CircularProgressIndicator.svelte"
    import VideoPreview from "$lib/components/calling/VideoPreview.svelte"
    import MouseListener from "$lib/components/ui/MouseListener.svelte"
    import { ConstellationStoreInstance } from "$lib/wasm/ConstellationStore"
    import type { FontOption } from "$lib/state/settings/default"

    TimeAgo.addDefaultLocale(en)

    let keybinds: Keybind[]
    let devmode: boolean = get(SettingsStore.state).devmode
    let color: string = get(UIStore.state.color)
    let fontSize: number = get(UIStore.state.fontSize)
    let font: FontOption = get(UIStore.state.font)
    let allFonts: FontOption[] = get(UIStore.state.allFonts)
    let emojiFont: EmojiFont = get(UIStore.state.emojiFont)
    let theme: Theme = get(UIStore.state.theme)
    let cssOverride: string = get(UIStore.state.cssOverride)
    let muted: boolean = get(Store.state.devices.muted)
    let deafened: boolean = get(Store.state.devices.deafened)

    function handleKeybindMatch(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
        let state: KeybindState = keybind.state

        switch (keybind.action) {
            case KeybindAction.IncreaseFontSize:
                UIStore.increaseFontSize()
                break
            case KeybindAction.DecreaseFontSize:
                UIStore.decreaseFontSize()
                break
            case KeybindAction.ToggleMute:
                Store.updateMuted(!muted)
                break
            case KeybindAction.ToggleDeafen:
                Store.updateDeafened(!deafened)
                break
            case KeybindAction.OpenInspector:
                log.info("todo")
                break
            case KeybindAction.ToggleDevmode:
                log.info("todo")
                break
            case KeybindAction.FocusUplink:
                log.info("todo")
                break
            case KeybindAction.PushToTalk:
                playSound(Sounds.Press)
                break
            case KeybindAction.PushToMute:
                playSound(Sounds.Press)
                break
            case KeybindAction.PushToDeafen:
                playSound(Sounds.Press)
                break
            default:
                console.warn("unhandled keybind", keybind)
        }
    }
    function handleKeybindMatchRelease(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
        let state: KeybindState = keybind.state

        switch (keybind.action) {
            case KeybindAction.PushToTalk:
                playSound(Sounds.Release)
                break
            case KeybindAction.PushToMute:
                playSound(Sounds.Release)
                break
            case KeybindAction.PushToDeafen:
                playSound(Sounds.Release)
                break
            default:
                log.warn(`unhandled keybind ${keybind}`)
        }
    }

    function buildStyle() {
        const activeFont = get(UIStore.state.font)
        const allFontsFromStore = get(UIStore.state.allFonts)
        let fontFaceRules = ""
        fontFaceRules = allFontsFromStore
            .map(({ text, value }) => {
                const isActiveFont = activeFont && activeFont.value === value

                if (text !== value) {
                    if (value.startsWith("blob:") && isActiveFont) {
                        return `
                    @font-face {
                        font-family: '${text}';
                        src: url('${value}'); // Use the blob URL directly
                        font-weight: normal;
                        font-style: normal;
                    }
                    `
                    }
                } else {
                    if (isActiveFont) {
                        return `
                    @font-face {
                        font-family: '${font.text}';
                        src: url('/assets/font/${font.text}.woff2') format('woff2'), 
                             url('/assets/font/${font.text}.woff') format('woff'); // Example static asset paths
                        font-weight: normal;
                        font-style: normal;
                    }
                    `
                    }
                }
            })
            .join("\n")

        const primaryFont = activeFont.text || font.text

        return `
    ${fontFaceRules}
    :root {
        --font-size: ${fontSize.toFixed(2)}rem;
        --primary-color: ${color};
        --primary-font: '${primaryFont}'; // Ensure primary font is set
    }
    .emoji {
        font-family: '${emojiFont}';
    }
    .theme {
        font-family: '${theme}';
    }
    `
    }

    function injectStyle(styleString: string) {
        const style = document.createElement("style")
        style.innerHTML = styleString
        document.head.appendChild(style)
    }

    let style: string = buildStyle()
    injectStyle(buildStyle())
    UIStore.state.color.subscribe(v => {
        color = v
        style = buildStyle()
    })

    UIStore.state.fontSize.subscribe(s => {
        fontSize = s
        style = buildStyle()
    })

    UIStore.state.cssOverride.subscribe(css => {
        cssOverride = css
        style = buildStyle()
    })

    UIStore.state.font.subscribe(f => {
        font = f
        style = buildStyle()
    })

    UIStore.state.allFonts.subscribe(f => {
        allFonts = f
        style = buildStyle()
    })

    UIStore.state.emojiFont.subscribe(f => {
        emojiFont = f
        style = buildStyle()
    })

    UIStore.state.theme.subscribe(f => {
        theme = f
        style = buildStyle()
    })

    SettingsStore.state.subscribe(settings => {
        keybinds = settings.keybinds
        devmode = settings.devmode
    })
    Store.state.devices.muted.subscribe(state => (muted = state))
    Store.state.devices.deafened.subscribe(state => (deafened = state))

    console.log("Arriving here on +layout")

    onMount(async () => {
        await checkIfUserIsLogged($page.route.id)
        await initializeLocale()
        buildStyle()
    })

    let isLocaleSet = false

    $: if ($locale) {
        isLocaleSet = true
    }
</script>

{#if isLocaleSet}
    <div id="app">
        {@html `<style>${style}</style>`}
        {@html `<style>${cssOverride}</style>`}
        <Polling rate={5000} />
        <KeyboardListener keybinds={keybinds} on:match={handleKeybindMatch} on:matchRelease={handleKeybindMatchRelease} />
        <MouseListener on:clicked={() => {}} />
        <Toasts />
        <IncomingCall />
        <VideoPreview />
        <GamepadListener />
        <slot></slot>
    </div>
{:else}
    <CircularProgressIndicator />
{/if}

<style lang="scss">
    #app {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }
</style>
