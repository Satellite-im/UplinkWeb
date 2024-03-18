<script lang="ts">    
    import Button from "$lib/elements/Button.svelte"
    import { Appearance } from "$lib/enums"
    import { Icon } from "$lib/elements"
    import type { ContextItem } from "$lib/types"

    export let items: ContextItem[] = []
</script>

<div class="context-menu">
    <div class="header">
        <slot></slot>
    </div>
    {#each items as item}
        <Button class="item" appearance={Appearance.Transparent} text={item.text}>
            <Icon icon={item.icon}/>
        </Button>
    {/each}
</div>

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