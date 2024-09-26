<script lang="ts">
    import { goto } from "$app/navigation"
    import { page } from "$app/stores"
    import { Route, SettingsRoute, Shape } from "$lib/enums"

    import Navigation from "$lib/layouts/Navigation.svelte"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Topbar from "$lib/layouts/Topbar.svelte"
    import { SettingsStore } from "$lib/state"
    import { UIStore } from "$lib/state/ui"
    import type { NavRoute } from "$lib/types"
    import { checkMobile } from "$lib/utils/Mobile"
    import { onMount } from "svelte"
    import { _ } from "svelte-i18n"
    import { get, writable, type Writable } from "svelte/store"

    let settingsRoutes: Writable<NavRoute[]> = writable([
        {
            to: SettingsRoute.Profile,
            icon: Shape.Profile,
            name: $_("settings.profile.name"),
        },
        {
            to: SettingsRoute.Preferences,
            icon: Shape.Brush,
            name: $_("settings.customization.name"),
        },
        {
            to: SettingsRoute.Messages,
            icon: Shape.ChatBubble,
            name: $_("settings.messages.name"),
        },
        {
            to: SettingsRoute.AudioVideo,
            icon: Shape.Speaker,
            name: $_("settings.audio.name"),
        },
        {
            to: SettingsRoute.Extensions,
            icon: Shape.Beaker,
            name: $_("settings.extensions.name"),
        },
        {
            to: SettingsRoute.Keybinds,
            icon: Shape.Keybind,
            name: $_("settings.keybinds.name"),
        },
        {
            to: SettingsRoute.Gamepad,
            icon: Shape.Gamepad,
            name: $_("settings.gamepad.name"),
        },
        {
            to: SettingsRoute.Accessibility,
            icon: Shape.Eye,
            name: $_("settings.accessibility.name"),
        },
        {
            to: SettingsRoute.Notifications,
            icon: Shape.BellAlert,
            name: $_("settings.notifications.name"),
        },
        {
            to: SettingsRoute.Network,
            icon: Shape.Relay,
            name: $_("settings.network.name"),
        },
        {
            to: SettingsRoute.About,
            icon: Shape.Info,
            name: $_("settings.about.name"),
        },
        {
            to: SettingsRoute.Licenses,
            icon: Shape.Document,
            name: $_("settings.licenses.name"),
        },
    ])

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
                    {
                        to: SettingsRoute.Inventory,
                        icon: Shape.Inventory,
                        name: $_("settings.inventory.name"),
                    },
                    ...routes,
                    {
                        to: SettingsRoute.Developer,
                        icon: Shape.Code,
                        name: $_("settings.developer.name"),
                    },
                    {
                        to: SettingsRoute.Realms,
                        icon: Shape.Beaker,
                        name: $_("settings.realms.name"),
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
