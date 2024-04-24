<script lang="ts">
    import { goto } from "$app/navigation"
    import { page } from "$app/stores"
    import { ContextMenu } from "$lib/components"
    import { Route, SettingsRoute, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import Navigation from "$lib/layouts/Navigation.svelte"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { SettingsStore } from "$lib/state"
    import { UIStore } from "$lib/state/ui"
    import type { ContextItem, NavRoute } from "$lib/types"
    import { onMount } from "svelte"
    import { _ } from "svelte-i18n"
    import { get, writable, type Writable } from "svelte/store"


    let settingsRoutes: Writable<NavRoute[]> = writable([
        {
            to: SettingsRoute.Profile,
            icon: Shape.Profile,
            name: "Profile"
        },
        {
            to: SettingsRoute.Preferences,
            icon: Shape.Brush,
            name: "Customization"
        },
        {
            to: SettingsRoute.Messages,
            icon: Shape.ChatBubble,
            name: "Messages"
        },
        {
            to: SettingsRoute.AudioVideo,
            icon: Shape.Speaker,
            name: "Audio & Video"
        },
        {
            to: SettingsRoute.Extensions,
            icon: Shape.Beaker,
            name: "Extensions"
        },
        {
            to: SettingsRoute.Keybinds,
            icon: Shape.Keybind,
            name: "Keybinds"
        },
        {
            to: SettingsRoute.Accessability,
            icon: Shape.Eye,
            name: "Accessability"
        },
        {
            to: SettingsRoute.Notifications,
            icon: Shape.BellAlert,
            name: "Notifications"
        },
        {
            to: SettingsRoute.About,
            icon: Shape.Info,
            name: "About"
        },
        {
            to: SettingsRoute.Licenses,
            icon: Shape.Document,
            name: "Licenses"
        },
    ])

    initLocale()

    let loading = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let activeRoute = SettingsRoute.Profile;

    function toggleSidebar() {
        UIStore.toggleSidebar()
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
            case "/settings/developer": {
                activeRoute = SettingsRoute.Developer
                break
            }
        }
    })
    
    // TODO: Move to global state
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []

    UIStore.state.sidebarOpen.subscribe((s) => sidebarOpen = s)

    $: {
        let devmode = get(SettingsStore.state).devmode
        if (devmode) {
            if (!get(settingsRoutes).find(route => route.to === SettingsRoute.Developer)) {
                settingsRoutes.set([...get(settingsRoutes), {
                    to: SettingsRoute.Developer,
                    icon: Shape.Code,
                    name: "Developer"
                }])
            }
        } else {
            settingsRoutes.set(get(settingsRoutes).filter(route => route.to !== SettingsRoute.Developer))
        }
    }
</script>

<div id="settings">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Settings} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Settings}>
        <Navigation 
            routes={get(settingsRoutes)} 
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