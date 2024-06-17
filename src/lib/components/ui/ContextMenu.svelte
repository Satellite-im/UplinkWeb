<script lang="ts" context="module">
    // A close handler referencing the current open context menu
    let close_context: any
</script>

<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { clickoutside } from "@svelte-put/clickoutside"
    import { Appearance } from "$lib/enums"
    import type { ContextItem } from "$lib/types"
    import { createEventDispatcher, tick } from "svelte"

    let visible: boolean = false
    let coords: [number, number] = [0, 0]
    let context: HTMLElement
    export let items: ContextItem[] = []
    export let hook: string = ""

    const dispatch = createEventDispatcher()
    function onClose(event: CustomEvent<MouseEvent>) {
        visible = false
        dispatch("close", event)
        close_context = undefined
    }

    function calculatePos(evt: MouseEvent): [number, number] {
        if (context === undefined) return [evt.clientX, evt.clientY]
        const { width, height } = context.getBoundingClientRect()
        let offsetX = evt.pageX
        let offsetY = evt.pageY
        let screenWidth = evt.view!.innerWidth
        let screenHeight = evt.view!.innerHeight
        let overFlowY = screenHeight < height + offsetY
        let overFlowX = screenWidth < width + offsetX
        let topY = Math.max(5, overFlowY ? offsetY - height : offsetY)
        let minX = 5
        let topX = Math.max(minX, overFlowX ? offsetX - width : offsetX)
        return [topX, topY]
    }

    async function openContext(evt: MouseEvent) {
        // Close the previous context if present
        if (close_context !== undefined) {
            close_context()
        }
        close_context = () => (visible = false)
        evt.preventDefault()
        visible = true
        coords = [evt.clientX, evt.clientY]
        await tick()
        coords = calculatePos(evt)
    }

    function handleItemClick(e: MouseEvent, item: ContextItem) {
        e.stopPropagation() // Prevent clickoutside from closing the menu
        console.log("Clicked", item.text)
        item.onClick()
        const customEvent = new CustomEvent("customMouseEvent", {
            detail: e,
        })
        onClose(customEvent)
    }
</script>

<!-- Slot containing the actual elements. Assign the open props to the context event -->
<slot name="content" open={openContext} />
{#if visible}
    <!-- Slot containing the actual elements -->
    <div id="context-menu" data-cy={hook} bind:this={context} use:clickoutside on:clickoutside={onClose} style={`left: ${coords[0]}px; top: ${coords[1]}px;`}>
        <slot name="items" close={onClose}></slot>
        {#each items as item}
            <Button hook={item.id} class="item" appearance={item.appearance === Appearance.Default ? Appearance.Transparent : item.appearance} text={item.text} on:click={e => handleItemClick(e, item)}>
                <Icon icon={item.icon} />
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
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        -webkit-backdrop-filter: blur(var(--blur-radius));
        padding: var(--padding-less);
        border-radius: var(--border-radius);
        border: var(--border-width) solid var(--border-color);

        :global(.item) {
            justify-content: flex-start;
        }
    }
</style>
