<script lang="ts">
    import { Input, Icon } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import { slide } from "svelte/transition"
    import { animationDuration } from "$lib/globals/animations"

    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/Store"
    import type { Call } from "$lib/types"

    export let open: boolean = true
    export let activeCall: Call | null = get(Store.state.activeCall)

    const dispatch = createEventDispatcher()
    function handleToggle() {
        dispatch("toggle", open)
    }

    Store.state.activeCall.subscribe(c => (activeCall = c))
</script>

{#if open}
    <div class="sidebar" transition:slide={{ duration: animationDuration, axis: "x" }}>
        <div class="sidebar-pre">
            <Input alt placeholder={$_("generic.search_placeholder")}>
                <Icon icon={Shape.Search} />
            </Input>
        </div>
        <div class="sidebar-content">
            <slot></slot>
        </div>
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
