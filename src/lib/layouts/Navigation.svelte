<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"
    import { Appearance, Route, SettingsRoute } from "$lib/enums"
    import { SettingsStore, type ISettingsState } from "$lib/state"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import type { FriendRequest, NavRoute } from "$lib/types"
    import { checkMobile } from "$lib/utils/Mobile"
    import { createEventDispatcher } from "svelte"
    import { get } from "svelte/store"

    export let routes: NavRoute[] = []
    export let activeRoute: Route | SettingsRoute = Route.Home
    export let icons: boolean = false
    export let vertical: boolean = false

    let settings: ISettingsState = get(SettingsStore.state)
    SettingsStore.state.subscribe((s: ISettingsState) => {
        settings = s
    })

    $: incomingRequests = Store.inboundRequests

    function overrides(route: NavRoute) {
        if (route.to === Route.Chat && settings.messaging.quick) {
            return true
        }
        if (route.to === Route.Settings) return true
    }

    const dispatch = createEventDispatcher()
    function handleNavigate(route: NavRoute) {
        if (checkMobile() && !overrides(route)) UIStore.state.sidebarOpen.set(false)
        dispatch("navigate", route.to.toString())
    }
</script>

<div class="navigation {vertical ? 'vertical' : 'horizontal'} {icons ? 'icons' : ''}">
    {#each routes as route}
        <div class="navigation-control {!icons ? 'fill' : ''}">
            <Button
                hook="button-{route.name}"
                badge={route.to === "/friends" ? (incomingRequests.length ? incomingRequests.length : 0) : 0}
                fill={!icons}
                tooltip={route.name}
                icon={icons}
                outline={activeRoute !== route.to && !icons}
                appearance={activeRoute === route.to ? Appearance.Primary : Appearance.Alt}
                on:click={_ => handleNavigate(route)}>
                <Icon icon={route.icon} />
                {#if !icons}
                    <Text>{route.name}</Text>
                {/if}
            </Button>
        </div>
    {/each}
</div>

<style lang="scss">
    .navigation {
        display: inline-flex;
        gap: var(--gap);
        justify-content: space-evenly;
        width: 100%;

        &.vertical {
            flex-direction: column;
        }

        .navigation-control {
            display: inline-flex;
            flex-direction: column;
            align-items: center;

            &.fill {
                flex: 1;

                :global(.text) {
                    justify-content: space-between;
                }
            }
        }
    }

    @media only screen and (max-width: 600px) {
        .navigation {
            padding-bottom: var(--padding);
        }
    }
</style>
