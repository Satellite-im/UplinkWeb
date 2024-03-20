<script lang="ts">
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Shape } from "$lib/enums";
    import type { ContextItem } from "$lib/types";
    import { clickoutside } from '@svelte-put/clickoutside';
    export let items: ContextItem[] = [];
    export let showMenu = false;
    export let parentClass = "";

    let pos = { x: 0, y: 0 };
    let menu = { h: 0, w: 0 };
    let browser = { h: 0, w: 0 };

    function rightClickContextMenu(e: MouseEvent){
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        pos = {
            x: e.clientX,
            y: e.clientY
        };

        if (browser.h - pos.y < menu.h)
            pos.y = pos.y - menu.h;
        if (browser.w - pos.x < menu.w)
            pos.x = pos.x - menu.w;
    }

    function onPageClick(){
        showMenu = false;
    }

    function getContextMenuDimension(node: HTMLDivElement){
        let height = node.offsetHeight;
        let width = node.offsetWidth;
        menu = {
            h: height,
            w: width
        };
    }

    function handleContextMenu(event: MouseEvent) {
        if (!event.target || !(event.target instanceof Element)) {
            return;
        }
        const target = event.target as Element;

        if (target.closest(parentClass)) {
            showMenu = true;
        } 
        if (!target.closest(parentClass)) {
            event.preventDefault();
            showMenu = false;
        }
    }

    // Add event listener for right-click events on the window
    window.addEventListener('contextmenu', handleContextMenu);
</script>

{#if showMenu}
<div class="context-menu" use:getContextMenuDimension use:clickoutside on:clickoutside={onPageClick} style="position: absolute; top:{pos.y}px; left:{pos.x}px">
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

<svelte:window on:contextmenu|preventDefault={rightClickContextMenu} />