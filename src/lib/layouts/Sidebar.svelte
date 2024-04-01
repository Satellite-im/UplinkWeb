<script lang="ts">
    import { routes } from "$lib/mock/routes"
    import Navigation from "./Navigation.svelte"
    import { Input, Icon, Button } from "$lib/elements"
    import { CallControls } from "$lib/components"
    import { Appearance, Route, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import { slide } from "svelte/transition"
    import { animationDuration } from "$lib/globals/animations"
    import { goto } from "$app/navigation"
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    initLocale()

    export let activeRoute: Route       = Route.Chat
    export let open: boolean            = true
    export let loading: boolean         = true

    const dispatch = createEventDispatcher()
    function handleToggle() {
        dispatch('toggle', open)
    }
</script>

{#if open}
    <div class="sidebar" transition:slide={{duration: animationDuration, axis: "x"}}>
        <div class="sidebar-pre">
            <Input alt placeholder={$_("generic.search_placeholder")}>
                <Icon icon={Shape.Search} />
            </Input>

            <Button icon appearance={Appearance.Alt} on:click={handleToggle} loading={loading}>
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
        min-width: var(--sidebar-width);
        width: var(--sidebar-width);
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding-less);
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
        }

        .sidebar-pre {
            width: 100%;
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
        }
    }

</style>