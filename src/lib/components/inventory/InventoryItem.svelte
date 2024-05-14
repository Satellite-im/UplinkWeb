<script lang="ts">
    import { Text, Icon, Button } from "$lib/elements"
    import { Appearance, InventoryKind, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"

    export let name: string = ""
    export let preview: string = ""
    export let kind: InventoryKind = InventoryKind.Item
    export let equipped: boolean = false
    export let noButton: boolean = false
    export let unequip: boolean = false
    export let empty: boolean = false

    const dispatch = createEventDispatcher()
</script>

<div class="inventory-item {equipped ? 'equipped' : ''}">
    <img src={preview} alt="" />
    <Text>{name}</Text>
    <Text muted>{kind}</Text>
    {#if !noButton}
        <Button
            text={equipped ? "Equipped" : "Equip"}
            fill
            on:click={() => {
                dispatch("apply")
            }}
            appearance={equipped ? Appearance.Primary : Appearance.Alt}>
            {#if equipped}
                <Icon icon={Shape.CheckMark} />
            {:else}
                <Icon icon={Shape.Plus} />
            {/if}
        </Button>
    {/if}
    {#if unequip}
        <Button
            text={empty ? "No Frame" : "Unequip"}
            fill
            on:click={() => {
                dispatch("apply")
            }}
            appearance={Appearance.Alt}
            disabled={empty}>
            <Icon icon={empty ? Shape.Plus : Shape.Minus} />
        </Button>
    {/if}
</div>

<style>
    .inventory-item {
        width: var(--min-component-width);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        justify-content: center;
        align-items: center;
        gap: var(--gap-less);
    }
</style>
