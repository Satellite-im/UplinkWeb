<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import { UIStore } from "$lib/state/ui"
    import { checkMobile } from "$lib/utils/Mobile"
    import { get } from "svelte/store"

    export let simple: boolean = false
    export let hideSidebarToggle: boolean = false
    let showControls: boolean = false
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

    {#if $$slots.controls}
        {#if checkMobile()}
            <Button
                hook="button-show-controls"
                appearance={Appearance.Alt}
                icon
                on:click={_ => {
                    showControls = !showControls
                }}>
                <Icon icon={Shape.VerticalEllipsis} />
            </Button>

            {#if showControls}
                <button
                    class="dropdown-mask"
                    on:click={_ => {
                        showControls = false
                    }}>
                </button>
                <div
                    class="controls-dropdown"
                    data-cy="controls-dropdown"
                    role="button"
                    tabindex="0"
                    on:click={_ => {
                        showControls = false
                    }}
                    on:keydown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            showControls = false
                        }
                    }}>
                    <slot name="controls" />
                </div>
            {/if}
        {:else}
            <Controls>
                <slot name="controls" />
            </Controls>
        {/if}
    {/if}
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

        .controls-dropdown {
            background-color: var(--background-alt);
            display: inline-flex;
            flex-direction: column;
            right: var(--gap);
            top: var(--input-height);
            position: absolute;
            z-index: 5;
            padding: var(--padding-less);
            border-radius: var(--border-radius-more);
            gap: var(--gap);
        }

        .dropdown-mask {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 4;
            -webkit-backdrop-filter: blur(var(--blur-radius));
            backdrop-filter: blur(var(--blur-radius));
            background: transparent;
            border: none;
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
