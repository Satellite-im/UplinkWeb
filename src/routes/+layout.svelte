<script lang="ts">
    import { Store } from '$lib/state/Store'
    import '/src/app.scss'
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'

    TimeAgo.addDefaultLocale(en)

    let color: string = ""

    function buildStyle() {
        return `:root {
            --primary-color: ${color};
        }`
    }
    let style: string = buildStyle()
    Store.state.ui.color.subscribe(v => {
        color = v
        style = buildStyle()
    })
</script>

<div id="app">
    {@html `<style>${style}</style>`}
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