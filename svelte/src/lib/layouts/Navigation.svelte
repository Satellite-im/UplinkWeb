<script lang="ts">
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Route } from "$lib/enums";
    import type { NavRoute } from "$lib/types";

    export let routes: NavRoute[] = [];
    export let activeRoute: Route = Route.Chat;
    export let icons: boolean = false;
    export let vertical: boolean = false;
</script>

<div class="navigation {vertical ? "vertical" : "horizontal"} {icons ? "icons" : ""}">
    {#each routes as route}
        <div class="navigation-control">
            <Button 
                tooltip={route.name}
                icon
                appearance={(activeRoute === route.to) ? Appearance.Primary : Appearance.Alt }>
                <Icon icon={route.icon} />
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
        }
    }
</style>