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
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/store"
    import type { Call } from "$lib/types"

    initLocale()

    export let activeRoute: Route = Route.Chat
    export let open: boolean = true
    export let loading: boolean = true
    export let activeCall: Call | null = get(Store.state.activeCall)

    export let search: string = ""
    const dispatch = createEventDispatcher()
    function handleToggle() {
        dispatch("toggle", open)
    }

    function handleEnter() {
        dispatch("enter", search)
    }

    function handleSearch() {
        dispatch("search", search)
    }

    Store.state.activeCall.subscribe(c => (activeCall = c))
</script>

{#if open}
    <div class="sidebar" data-cy="sidebar" transition:slide={{ duration: animationDuration, axis: "x" }}>
        <div class="sidebar-pre">
            <Input hook="input-sidebar-search" alt placeholder={$_("generic.search_placeholder")} bind:value={search} on:enter={handleEnter} on:input={handleSearch}>
                <Icon icon={Shape.Search} />
            </Input>

            <Button hook="button-hide-sidebar" icon appearance={Appearance.Alt} on:click={handleToggle} loading={loading}>
                <Icon icon={Shape.Sidebar} />
            </Button>
        </div>
        <div class="sidebar-content">
            <slot></slot>
        </div>

        <div class="popups">
            {#if activeCall}
                <CallControls />
            {/if}
        </div>
        <Navigation icons routes={routes} activeRoute={activeRoute} on:navigate={e => goto(e.detail)} />
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
            padding-right: var(--gap);
            flex: 1;
            width: 100%;
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
