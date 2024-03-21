<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { clickoutside } from "@svelte-put/clickoutside"
    import { Appearance } from "$lib/enums"
    import type { ContextItem } from "$lib/types"
    import { createEventDispatcher } from "svelte"

    export let visible: boolean             = false
    export let coords: [number, number]     = [0, 0]
    export let items: ContextItem[]         = []

    const dispatch = createEventDispatcher()
    function onClose(event: CustomEvent<MouseEvent>) {
        visible = false
        dispatch('close', event)
    }
</script>

{#if visible}
    <div 
        id="context-menu" 
        use:clickoutside 
        on:clickoutside={onClose}
        style={`left: ${coords[0]}px; top: ${coords[1]}px;`}>
        <div class="header">
            <slot></slot>
        </div>
        {#each items as item}
            <Button class="item" appearance={Appearance.Transparent} text={item.text}>
                <Icon icon={item.icon}/>
            </Button>
        {/each}
    </div>
{/if}

<style lang="scss">
    #context-menu {
        z-index: 1000;
        position: fixed;
        top: 0;
        left: 0;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap-less);
        background-color: var(--background-alt);
        padding: var(--padding);
        border-radius: var(--border-radius-more);
        border: var(--border-width) solid var(--border-color);

        .header {
            display: inline-flex;
            gap: var(--gap-less);
        }

        :global(.item) {
            justify-content: flex-start;
        }
    }
</style>

