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
    import CallControls from "$lib/components/CallControls.svelte";
    import { goto } from "$app/navigation";

    export let activeRoute: Route = Route.Chat;
    export let open: boolean = true;
    export let loading: boolean = true;

    const dispatch = createEventDispatcher();
    function handleToggle() {
        dispatch('toggle', open);
    }
</script>

{#if open}
    <div class="sidebar" transition:slide={{duration: animationDuration, axis: "x"}}>
        <div class="sidebar-pre">
            <Input alt placeholder="Search . . .">
                <Icon icon={Shape.Search} />
            </Input>

            <Button icon appearance={Appearance.Alt} on:click={handleToggle}>
                <Icon icon={Shape.Sidebar} />
            </Button>
        </div>
        <div class="sidebar-content">
            <slot></slot>
        </div>

        <div class="popups">
            <CallControls />
        </div>
        <Navigation icons routes={routes} activeRoute={activeRoute} on:navigate={(e) => goto(e.detail)}/>
    </div>
{/if}

<style lang="scss">
    .sidebar {
        width: var(--sidebar-width);
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--gap);
        border-right: var(--border-width) solid var(--border-color);

        .sidebar-content {
            display: flex;
            flex-direction: column;
            padding-right : var(--gap);
            flex: 1;
            width: 100%;
            overflow-x: hidden;
            overflow-y: scroll;
            gap: var(--gap);
            mask-image: linear-gradient(to bottom, var(--background) calc(100% - (var(--sidebar-width) / 6)), transparent 100%);
        }

        .sidebar-pre {
            width: 100%;
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
        }
    }

</style>