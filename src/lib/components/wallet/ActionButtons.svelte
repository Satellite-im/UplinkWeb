<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    export let activeButton: string

    function handleSend() {
        dispatch("send")
    }

    function handleReceive() {
        dispatch("receive")
    }
</script>

<div class="action-buttons">
    <Button appearance={activeButton === "send" ? Appearance.Primary : Appearance.Alt} on:click={handleSend} fill text="Send">
        <Icon icon={Shape.ArrowUp} />
    </Button>
    <Button appearance={activeButton === "receive" ? Appearance.Primary : Appearance.Alt} on:click={handleReceive} fill text="Receive">
        <Icon icon={Shape.ArrowDown} />
    </Button>
</div>

<style lang="scss">
    .action-buttons {
        display: flex;
        gap: var(--gap);
    }
</style>
