<script lang="ts">    
    import Button from "$lib/elements/Button.svelte"
    import { Appearance } from "$lib/enums"
    import { Icon } from "$lib/elements"
    import type { ContextItem } from "$lib/types"

    export let items: ContextItem[] = []

    // pos is cursor position when right click occur
    let pos = { x: 0, y: 0 }
    // menu is dimension (height and width) of context menu
    let menu = { h: 0, y: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, y: 0 }
    // showMenu is state of context-menu visibility
    let showMenu = false;

    function rightClickContextMenu(e: { clientX: any; clientY: any; }){
        showMenu = true
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        pos = {
            x: e.clientX,
            y: e.clientY
        };
        // If bottom part of context menu will be displayed
        // after right-click, then change the position of the
        // context menu. This position is controlled by `top` and `left`
        // at inline style. 
        // Instead of context menu is displayed from top left of cursor position
        // when right-click occur, it will be displayed from bottom left.
        if (browser.h -  pos.y < menu.h)
            pos.y = pos.y - menu.h
        if (browser.w -  pos.x < menu.w)
            pos.x = pos.x - menu.w
    }
    function onPageClick(e: any){
        // To make context menu disappear when
        // mouse is clicked outside context menu
        showMenu = false;
    }
    function getContextMenuDimension(node: HTMLDivElement){
        // This function will get context menu dimension
        // when navigation is shown => showMenu = true
        let height = node.offsetHeight
        let width = node.offsetWidth
        menu = {
            h: height,
            w: width
        }
    }
</script>
{#if showMenu}
<div class="context-menu" use:getContextMenuDimension style="position: absolute; top:{pos.y}px; left:{pos.x}px">
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
    .context-menu {
        z-index: 1000;
        position: absolute;
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
            margin-bottom: var(--gap);
        }

        :global(.item) {
            justify-content: flex-start;
        }
    }
</style>
<svelte:window on:contextmenu|preventDefault={rightClickContextMenu} 
on:click={onPageClick} />