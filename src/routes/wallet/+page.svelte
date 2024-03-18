<script lang="ts">
    import { Route } from "$lib/enums"
    import { Sidebar, Slimbar } from "$lib/layouts"
    import { initLocale } from "$lib/lang"
    import { onMount } from "svelte"
    import { _ } from "svelte-i18n"

    // Initialize locale
    initLocale()

    let loading: boolean = true
    let sidebarOpen: boolean = true

    // Mock loading behavior
    onMount(() => {
        setTimeout(() => loading = false, 1500)
    })

    function toggleSidebar(): void {
        sidebarOpen = !sidebarOpen
    }
</script>

<div id="page">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Wallet} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Wallet} >
       Wallet Sidebar
    </Sidebar>
    <div class="content">
        Wallet
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;
        
        
        .content {
            display: flex;
            min-height: 0;
            display: flex;
            flex-direction: column;
            flex: 1;

        }
    }
</style>
