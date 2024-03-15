<script lang="ts">
    import { goto } from "$app/navigation";
    import { Route } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import Navigation from "$lib/layouts/Navigation.svelte"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { settingsRoutes } from "$lib/mock/routes"
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

<div id="settings">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Settings} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Settings}>
        <Navigation routes={settingsRoutes} vertical on:navigate={(e) => goto(e.detail)}/>
    </Sidebar>

    <div class="content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    #settings {
        display: flex;
        height: 100%;
        margin: 0;
        flex: 1;
        overflow: hidden;

        .content {
            flex: 1;
            padding: var(--padding);
        }
    }
</style>