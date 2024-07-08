<script lang="ts">
    export const ssr = false

    import { goto } from "$app/navigation"
    import { page } from "$app/stores"
    import { Toasts } from "$lib/components"
    import Polling from "$lib/components/Polling.svelte"
    import GamepadListener from "$lib/components/ui/GamepadListener.svelte"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { Sound, Sounds } from "$lib/components/utils/Sounds"
    import { EmojiFont, Font, KeybindAction, KeybindState, Route } from "$lib/enums"
    import { SettingsStore, type ISettingsState } from "$lib/state"
    import { AuthStore } from "$lib/state/auth"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import { RelayStore } from "$lib/state/wasm/relays"
    import type { Keybind } from "$lib/types"
    import { log } from "$lib/utils/Logger"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { WarpStore } from "$lib/wasm/WarpStore"
    import "/src/app.scss"
    import TimeAgo from "javascript-time-ago"
    import en from "javascript-time-ago/locale/en"
    import { get } from "svelte/store"

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
                Sounds.play(Sound.Press)
                break
            case KeybindAction.PushToMute:
                Sounds.play(Sound.Press)
                break
            case KeybindAction.PushToDeafen:
                Sounds.play(Sound.Press)
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
                Sounds.play(Sound.Release)
                break
            case KeybindAction.PushToMute:
                Sounds.play(Sound.Release)
                break
            case KeybindAction.PushToDeafen:
                Sounds.play(Sound.Release)
                break
            default:
                log.warn(`unhandled keybind ${keybind}`)
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

    async function checkIfUserIsLogged() {
        await TesseractStoreInstance.initTesseract()
        let authentication = await AuthStore.getAuthentication()
        if (authentication.pin === "") {
            log.info("No pin stored, redirecting to unlock")
            goto(Route.Unlock)
        } else if ($page.route.id !== Route.Unlock) {
            // We need to find a better way of handling it so the password doesnt get stored
            // But for now: dont login if the user is on the login page
            log.info("Pin stored, unlocking")
            let addressed = Object.values(get(RelayStore.state))
                .filter(r => r.active)
                .map(r => r.address)
            await WarpStore.initWarpInstances(addressed)
            let result = await TesseractStoreInstance.unlock(authentication.pin)
            result.onSuccess(() => {
                setTimeout(() => MultipassStoreInstance.initMultipassListener(), 1000)
            })
            if (!authentication.stayLoggedIn) {
                goto(Route.Unlock)
            }
        }
    }

    checkIfUserIsLogged()
</script>

<div id="app">
    {@html `<style>${style}</style>`}
    {@html `<style>${cssOverride}</style>`}
    <!-- <Titlebar /> -->
    <Polling rate={5000} />
    <KeyboardListener keybinds={keybinds} on:match={handleKeybindMatch} on:matchRelease={handleKeybindMatchRelease} />
    <Toasts />
    {#if devmode}
        <GamepadListener />
    {/if}
    <slot></slot>
</div>

<style lang="scss">
    #app {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }
</style>
