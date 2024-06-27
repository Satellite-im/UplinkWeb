<script lang="ts">
    import { goto } from "$app/navigation"
    import { page } from "$app/stores"
    import { Route, SettingsRoute, Shape } from "src/lib/enums"
    import { initLocale } from "src/lib/lang"
    import Navigation from "src/lib/layouts/Navigation.svelte"
    import Sidebar from "src/lib/layouts/Sidebar.svelte"
    import Topbar from "src/lib/layouts/Topbar.svelte"
    import { SettingsStore } from "src/lib/state"
    import { UIStore } from "src/lib/state/ui"
    import type { NavRoute } from "src/lib/types"
    import { checkMobile } from "src/lib/utils/Mobile"
    import { onMount } from "svelte"
    import { _ } from "svelte-i18n"
    import { get, writable, type Writable } from "svelte/store"

    let settingsRoutes: Writable<NavRoute[]> = writable([
        {
            to: SettingsRoute.Profile,
            icon: Shape.Profile,
            name: "Profile",
        },
        {
            to: SettingsRoute.Inventory,
            icon: Shape.Inventory,
            name: "Inventory",
        },
        {
            to: SettingsRoute.Preferences,
            icon: Shape.Brush,
            name: "Customization",
        },
        {
            to: SettingsRoute.Messages,
            icon: Shape.ChatBubble,
            name: "Messages",
        },
        {
            to: SettingsRoute.AudioVideo,
            icon: Shape.Speaker,
            name: "Audio & Video",
        },
        {
            to: SettingsRoute.Extensions,
            icon: Shape.Beaker,
            name: "Extensions",
        },
        {
            to: SettingsRoute.Keybinds,
            icon: Shape.Keybind,
            name: "Keybinds",
        },
        {
            to: SettingsRoute.Accessibility,
            icon: Shape.Eye,
            name: "Accessibility",
        },
        {
            to: SettingsRoute.Notifications,
            icon: Shape.BellAlert,
            name: "Notifications",
        },
        {
            to: SettingsRoute.Network,
            icon: Shape.Relay,
            name: "Network",
        },

        {
            to: SettingsRoute.About,
            icon: Shape.Info,
            name: "About",
        },
        {
            to: SettingsRoute.Licenses,
            icon: Shape.Document,
            name: "Licenses",
        },
    ])

    initLocale()

    let loading = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let activeRoute = SettingsRoute.Profile

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    onMount(() => {
        switch ($page.url.pathname) {
            case "/settings/preferences": {
                activeRoute = SettingsRoute.Preferences
                break
            }
            case "/settings/inventory": {
                activeRoute = SettingsRoute.Inventory
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
            case "/settings/network": {
                activeRoute = SettingsRoute.Network
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

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))
    $: setRoutes = get(settingsRoutes)
    SettingsStore.state.subscribe(value => {
        let isMobile: boolean = checkMobile()
        if (value.devmode) {
            if (!get(settingsRoutes).find(route => route.to === SettingsRoute.Developer)) {
                settingsRoutes.update(routes => [
                    ...routes,
                    {
                        to: SettingsRoute.Developer,
                        icon: Shape.Code,
                        name: "Developer",
                    },
                ])
            }
        } else {
            settingsRoutes.update(routes => routes.filter(route => route.to !== SettingsRoute.Developer))
        }

        if (isMobile) {
            settingsRoutes.update(routes => routes.filter(route => route.to !== SettingsRoute.Keybinds))
        }
    })

    onMount(() => {
        // Ensure settingsRoutes is reactive
        const unsubscribe = settingsRoutes.subscribe(routes => {
            setRoutes = routes
        })
        return () => unsubscribe()
    })
</script>

<div id="settings">
    <!-- Context Menu-->
    <!-- Unused atm -->
    <!-- <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={_ => (contextData = [])} /> -->

    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Settings}>
        <Navigation
            routes={setRoutes}
            vertical
            on:navigate={e => {
                goto(e.detail)
                activeRoute = e.detail
            }}
            activeRoute={activeRoute} />
    </Sidebar>

    <div class="content">
        {#if checkMobile()}
            <Topbar />
        {/if}
        <div class="slot">
            <slot></slot>
        </div>
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
            min-width: 0;
            height: 100%;
            overflow-y: scroll;
            overflow-x: hidden;

            .slot {
                width: 100%;
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap);
            }
        }
    }
</style>
