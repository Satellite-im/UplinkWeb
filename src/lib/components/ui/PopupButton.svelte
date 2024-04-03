<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import Modal from "./Modal.svelte";

    export let open: boolean    = false
    export let name: string     = "name"
    
    function toggle() {
        open = !open 
    }
</script>
<div class="popup">
    {#if open}
        <Modal on:close={toggle}>
            <slot></slot>
            <svelte:fragment slot="controls">
                <Button 
                    icon 
                    small 
                    appearance={Appearance.Alt}
                    on:click={toggle}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
        </Modal>
    {/if}
    <Button 
        icon
        outline
        appearance={Appearance.Alt} 
        class="control" 
        tooltip={name}
        on:click={toggle}>
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
        min-height: var(--min-height);
        max-height: 80vh;
        max-width: var(--popup-width);
        background-color: var(--background-alt);
        overflow-y: auto;
    }
}
</style>