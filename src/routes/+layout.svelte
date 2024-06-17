<script lang="ts">
    import { Toasts } from "$lib/components"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { Font, KeybindAction } from "$lib/enums"
    import { SettingsStore } from "$lib/state"
    import { Store } from "$lib/state/store"
    import { UIStore } from "$lib/state/ui"
    import type { Keybind } from "$lib/types"
    import { log } from "$lib/utils/Logger"
    import "/src/app.scss"
    import TimeAgo from "javascript-time-ago"
    import en from "javascript-time-ago/locale/en"
    import { get } from "svelte/store"

    TimeAgo.addDefaultLocale(en)

    let keybinds: Keybind[]
    let color: string = get(UIStore.state.color)
    let fontSize: number = get(UIStore.state.fontSize)
    let font: Font = get(UIStore.state.font)
    let cssOverride: string = get(UIStore.state.cssOverride)
    let muted: boolean = get(Store.state.devices.muted)
    let deafened: boolean = get(Store.state.devices.deafened)

    function handleKeybindMatch(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
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

    SettingsStore.state.subscribe(settings => (keybinds = settings.keybinds))
    Store.state.devices.muted.subscribe(state => (muted = state))
    Store.state.devices.deafened.subscribe(state => (deafened = state))
</script>

<div id="app">
    {@html `<style>${style}</style>`}
    {@html `<style>${cssOverride}</style>`}
    <!-- <Titlebar /> -->
    <KeyboardListener keybinds={keybinds} on:match={handleKeybindMatch} />
    <Toasts />
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
