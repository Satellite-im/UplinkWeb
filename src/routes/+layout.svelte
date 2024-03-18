<script>
    import '/src/app.scss'
    import TimeAgo from 'javascript-time-ago'
    import en from 'javascript-time-ago/locale/en'

    TimeAgo.addDefaultLocale(en)
</script>

<div id="app">
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