<script lang="ts">
    import { Store } from '$lib/state/Store'
    import '/src/app.scss'
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'

    TimeAgo.addDefaultLocale(en)

    let color: string = ""
    let fontSize: string = "1.0"
    let cssOverride: string = "body { background: red; }"

    function buildStyle() {
        return cssOverride + `:root {
            --font-size: ${fontSize}rem;
            --primary-color: ${color};
        }`
    }
    let style: string = buildStyle()
    Store.state.ui.color.subscribe(v => {
        color = v
        style = buildStyle()
    })
    Store.state.ui.fontSize.subscribe(s => {
        fontSize = s.toFixed(2).toString()
        style = buildStyle()
    })
    Store.state.ui.cssOverride.subscribe(css => {
        cssOverride = css
        style = buildStyle()
    })
</script>

<div id="app">
    {@html `<style>${style}</style>`}
    {@html `<style>${cssOverride}</style>`}
    <!-- <Titlebar /> -->
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