<script lang="ts">
    import { Button } from "$lib/elements"
    import { Appearance } from "$lib/enums"

    export let open: boolean    = false
    export let name: string     = "name"
</script>

<div class="popup">
    {#if open}
        <div class="popup-body">
            <slot></slot>
        </div>
    {/if}
    <Button 
        icon 
        appearance={Appearance.Alt} 
        class="control" 
        tooltip={name}
        on:click={(_) => {
            open = !open
        }}>
        <slot name="icon"></slot>
    </Button>
</div>

<style lang="scss">
.popup {
    position: relative;
    
    :global(.control) {
        display: inline-flex;
        justify-content: center;
    }
    
    .popup-body {
        position: absolute;
        bottom: calc(100% + var(--gap));
        right: 0;
        padding: var(--padding);    
        border-radius: var(--border-radius);
        border: var(--border-width) solid var(--boerder-color);
        max-height: var(--min-height);
        max-width: var(--popup-width);
        background-color: var(--background-alt);
        overflow: hidden;
    }
}
</style>