<script lang="ts">
    import { routes } from "$lib/mock/routes";
    import Navigation from "./Navigation.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Route, Shape } from "$lib/enums";
    import Button from "$lib/elements/Button.svelte";
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import { animationDuration } from "$lib/globals/animations";

    export let sidebarOpen: boolean = true;
    export let activeRoute: Route = Route.Chat;

    const dispatch = createEventDispatcher();
    function handleToggle() {
        dispatch('toggle', sidebarOpen);
    }
</script>

<div class="slimbar">
    {#if !sidebarOpen}
        <div transition:slide={{duration: animationDuration, axis: "y"}}>
            <Button icon appearance={Appearance.Alt} on:click={handleToggle}>
                <Icon icon={Shape.Sidebar} />
            </Button>
        </div>
    {/if}

    <div class="content">
        <Button icon>
            <Icon />
        </Button>
    </div>

    {#if !sidebarOpen}
    <div transition:slide={{duration: animationDuration, axis: "y"}}>
        <Navigation vertical icons routes={routes} activeRoute={activeRoute} />
    </div>
    {/if}
</div>

<style lang="scss">
    .slimbar {
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding-less);
        gap: var(--gap);
        width: fit-content;
        border-right: var(--border-width) solid var(--border-color);

        .content {
            flex: 1;
        }
    }
</style>