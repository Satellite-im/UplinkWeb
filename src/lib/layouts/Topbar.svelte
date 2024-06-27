<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import { UIStore } from "$lib/state/ui"
    import { get } from "svelte/store"

    export let simple: boolean = false
    export let hideSidebarToggle: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    UIStore.state.sidebarOpen.subscribe(o => (sidebarOpen = o))
</script>

<div data-cy="topbar" class="topbar {simple ? 'simple' : ''}">
    {#if !sidebarOpen && !hideSidebarToggle}
        <Button class="sidebar-toggle-ext" hook="button-show-sidebar" icon appearance={Appearance.Alt} on:click={() => UIStore.toggleSidebar()}>
            <Icon icon={Shape.Sidebar} />
        </Button>
    {/if}

    <slot name="before" />
    <div class="content">
        <slot name="content" />
    </div>
    <Controls>
        <slot name="controls" />
    </Controls>
</div>

<style lang="scss">
    .topbar {
        width: 100%;
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        border-bottom: var(--border-width) solid var(--border-color);

        &.simple {
            border: none;
            padding: 0;
        }

        :global(.before) {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
        }

        .content {
            flex: 1;
            height: 100%;
            min-width: 0;
            justify-self: flex-start;
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
        }
    }

    @media (min-width: 800px) {
        .topbar {
            :global(.sidebar-toggle-ext) {
                display: none;
            }
        }
    }
</style>
