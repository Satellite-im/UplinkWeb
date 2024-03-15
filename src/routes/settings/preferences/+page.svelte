<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { onMount } from "svelte"
    import { _ } from 'svelte-i18n'

    initLocale()

    let loading = true
    let sidebarOpen = true

    // TODO: Mock
    onMount(() => {
        setTimeout(() => loading = false, 1500)
    })

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen
    }
</script>

<div id="page">
    Preferences
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
    }
</style>