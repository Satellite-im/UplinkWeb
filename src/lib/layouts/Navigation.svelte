<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"
    import { Appearance, Route, SettingsRoute } from "$lib/enums"
    import type { NavRoute } from "$lib/types"
    import { createEventDispatcher } from "svelte"

    export let routes: NavRoute[]                   = []
    export let activeRoute: Route | SettingsRoute   = Route.Home
    export let icons: boolean                       = false
    export let vertical: boolean                    = false

    const dispatch = createEventDispatcher()
    function handleNavigate(route: NavRoute) {
        dispatch('navigate', route.to.toString())
    }
</script>

<div class="navigation {vertical ? "vertical" : "horizontal"} {icons ? "icons" : ""}">
    {#each routes as route}
        <div class="navigation-control {!icons ? "fill" : ""}">
            <Button
                fill={!icons}
                tooltip={route.name}
                icon={icons}
                outline={(activeRoute !== route.to && !icons)}
                appearance={(activeRoute === route.to) ? Appearance.Primary : Appearance.Alt }
                on:click={(_) => handleNavigate(route)}>
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

                :gloabl(.text) {
                    justify-content: space-between;
                }
            }
        }
    }
</style>