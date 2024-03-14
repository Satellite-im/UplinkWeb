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

<div id="profile">
    profile
</div>

<style lang="scss">
    #settings-profile {
        display: flex;
        width: 100vw;
        height: 100vh;
        margin: 0;
    }
</style>