<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import Modal from "./Modal.svelte"

    export let open: boolean = false
    export let name: string = "name"
    export let hook: string = ""
    export let color: string = ""

    function toggle() {
        open = !open
    }

    let clazz = ""
    export { clazz as class }

    $: color
</script>

<div class="popup" data-cy={hook}>
    {#if open}
        <Modal on:close={toggle} padded class={clazz}>
            <slot></slot>
            <svelte:fragment slot="controls">
                <Button icon small appearance={Appearance.Alt} on:click={toggle} color={color}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
        </Modal>
    {/if}
    <Button icon outline appearance={Appearance.Alt} class="control" tooltip={name} on:click={toggle} color={color}>
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
    }
</style>
