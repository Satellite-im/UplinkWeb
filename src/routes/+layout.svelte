<script lang="ts">
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { Font, KeybindAction } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { Keybind } from "$lib/types"
    import "/src/app.scss"
    import TimeAgo from "javascript-time-ago"
    import en from "javascript-time-ago/locale/en"
    import { get } from "svelte/store";

    TimeAgo.addDefaultLocale(en)

    let color: string = get(Store.state.ui.color)
    let fontSize: number = get(Store.state.ui.fontSize)
    let font: Font = get(Store.state.ui.font)
    let cssOverride: string = get(Store.state.ui.cssOverride)
    let keybinds: Keybind[]

    function handleKeybindMatch(event: CustomEvent<any>) {
        let keybind: Keybind = event.detail
        switch (keybind.action) {
            case KeybindAction.IncreaseFontSize: Store.increaseFontSize(); break
            case KeybindAction.DecreaseFontSize: Store.decreaseFontSize(); break
            case KeybindAction.ToggleMute: console.log('todo'); break
            case KeybindAction.ToggleDeafen: console.log('todo'); break
            case KeybindAction.OpenInspector: console.log('todo'); break
            case KeybindAction.ToggleDevmode: console.log('todo'); break
            case KeybindAction.FocusUplink: console.log('todo'); break
            default:
                console.warn('unhandled keybind', keybind)
        }
    }

    function buildStyle() {
        return cssOverride + `:root {
            --font-size: ${fontSize}rem;
            --primary-color: ${color};
            --primary-font: ${font};
        }`
    }

    let style: string = buildStyle()
    Store.state.ui.color.subscribe(v => {
        color = v
        style = buildStyle()
    })
    Store.state.ui.fontSize.subscribe(s => {
        fontSize = parseInt(s.toFixed(2))
        style = buildStyle()
    })
    Store.state.ui.cssOverride.subscribe(css => {
        cssOverride = css
        style = buildStyle()
    })
    Store.state.ui.font.subscribe(f => {
        font = f
        style = buildStyle()
    })
    Store.state.settings.subscribe(settings => {
        keybinds = settings.keybinds
    })
</script>

<div id="app">
    {@html `<style>${style}</style>`}
    {@html `<style>${cssOverride}</style>`}
    <!-- <Titlebar /> -->
    <KeyboardListener {keybinds} on:match={handleKeybindMatch} />
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