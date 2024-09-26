<script lang="ts">
    import { page } from "$app/stores"
    import { Toasts } from "$lib/components"
    import IncomingCall from "$lib/components/calling/IncomingCall.svelte"
    import Polling from "$lib/components/Polling.svelte"
    import GamepadListener from "$lib/components/ui/GamepadListener.svelte"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { playSound, Sounds } from "$lib/components/utils/SoundHandler"
    import { EmojiFont, Font, KeybindAction, KeybindState } from "$lib/enums"
    import { VoiceRTCInstance } from "$lib/media/Voice"
    import { SettingsStore } from "$lib/state"
    import { checkIfUserIsLogged } from "$lib/state/auth"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import type { Keybind } from "$lib/types"
    import { log } from "$lib/utils/Logger"
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
    import Market from "$lib/components/market/Market.svelte"
    import InstallBanner from "$lib/components/ui/InstallBanner.svelte"
    import { swipe } from "$lib/components/ui/Swipe"

    TimeAgo.addDefaultLocale(en)

    let keybinds: Keybind[]
    let devmode: boolean = get(SettingsStore.state).devmode
    let color: string = get(UIStore.state.color)
    let fontSize: number = get(UIStore.state.fontSize)
    let font: Font = get(UIStore.state.font)
    let emojiFont: EmojiFont = get(UIStore.state.emojiFont)
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
                if (VoiceRTCInstance.isInCall) {
                    Store.updateMuted(!muted)
                    VoiceRTCInstance.toggleMute(!muted)
                }
                break
            case KeybindAction.ToggleDeafen:
                if (VoiceRTCInstance.isInCall) {
                    Store.updateDeafened(!deafened)
                    VoiceRTCInstance.toggleDeafen(!deafened)
                }
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
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Press)
                    VoiceRTCInstance.toggleMute(false)
                }
                break
            case KeybindAction.PushToMute:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Press)
                    VoiceRTCInstance.toggleMute(true)
                }
                break
            case KeybindAction.PushToDeafen:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Press)
                    VoiceRTCInstance.toggleDeafen(true)
                }
                break
            default:
                log.info("unhandled keybind " + keybind.action)
        }
    }

    function handleKeybindMatchRelease(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
        let state: KeybindState = keybind.state

        switch (keybind.action) {
            case KeybindAction.PushToTalk:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Release)
                    VoiceRTCInstance.toggleMute(true)
                }
                break
            case KeybindAction.PushToMute:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Release)
                    VoiceRTCInstance.toggleMute(false)
                }
                break
            case KeybindAction.PushToDeafen:
                if (VoiceRTCInstance.isInCall) {
                    playSound(Sounds.Release)
                    VoiceRTCInstance.toggleDeafen(false)
                }
                break
            default:
                log.info("unhandled keybind " + keybind.action)
        }
    }

    function buildStyle() {
        return (
            cssOverride +
            `:root {
                --font-size: ${fontSize.toFixed(2)}rem;
                --primary-color: ${color};
                --primary-font: ${font};
            }
            .emoji {
                font-family: ${emojiFont};
            }`
        )
    }

    let style: string = buildStyle()
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

    UIStore.state.emojiFont.subscribe(f => {
        emojiFont = f
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
    })

    let isLocaleSet = false

    $: if ($locale) {
        isLocaleSet = true
    }

    $: theme = UIStore.state.theme
</script>

{#if isLocaleSet}
    <div
        id="app"
        use:swipe
        on:swipeleft={_ => {
            UIStore.closeSidebar()
        }}
        on:swiperight={_ => {
            UIStore.openSidebar()
        }}>
        {@html `<style>${style}</style>`}
        <link rel="stylesheet" href={`/assets/themes/${$theme}.css`} />
        {@html `<style>${cssOverride}</style>`}
        <Polling rate={5000} />
        <KeyboardListener keybinds={keybinds} on:match={handleKeybindMatch} on:matchRelease={handleKeybindMatchRelease} />
        <MouseListener on:clicked={() => {}} />

        <Toasts />
        <IncomingCall />
        <VideoPreview />
        <GamepadListener />
        <Market on:close={() => UIStore.toggleMarket()} />
        <InstallBanner />
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
