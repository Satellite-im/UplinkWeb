<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { ContextMenu } from "$lib/components";
    import { Route, SettingsRoute } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import Navigation from "$lib/layouts/Navigation.svelte"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { settingsRoutes } from "$lib/mock/routes"
    import type { ContextItem } from "$lib/types"
    import { onMount } from "svelte"
    import { _ } from "svelte-i18n"

    initLocale()

    let loading = false
    let sidebarOpen = true
    let activeRoute = SettingsRoute.Profile;

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen
    }

    onMount(() => {
        switch ($page.url.pathname) {
            case "/settings/preferences": {
                activeRoute = SettingsRoute.Preferences
                break
            }
            case "/settings/message": {
                activeRoute = SettingsRoute.Messages
                break
            }
            case "/settings/licenses": {
                activeRoute = SettingsRoute.Licenses
                break
            }
            case "/settings/keybinds": {
                activeRoute = SettingsRoute.Keybinds
                break
            }
            case "/settings/extensions": {
                activeRoute = SettingsRoute.Extensions
                break
            }
            case "/settings/audio_video": {
                activeRoute = SettingsRoute.AudioVideo
                break
            }
            case "/settings/notifications": {
                activeRoute = SettingsRoute.Notifications
                break
            }
            case "/settings/profile": {
                activeRoute = SettingsRoute.Profile
                break
            }
        }
    })
    
    // TODO: Move to global state
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []
</script>

<div id="settings">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Settings} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Settings}>
        <Navigation 
            routes={settingsRoutes} 
            vertical
            on:navigate={(e) => {
                goto(e.detail)
                activeRoute = e.detail
            }} 
            activeRoute={activeRoute}/>
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