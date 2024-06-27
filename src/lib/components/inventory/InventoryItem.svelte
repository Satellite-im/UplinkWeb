<script lang="ts">
    import { Text, Icon, Button } from "src/lib/elements"
    import { Appearance, InventoryKind, Shape } from "src/lib/enums"
    import { createEventDispatcher } from "svelte"

    export let name: string = ""
    export let preview: string = ""
    export let kind: InventoryKind = InventoryKind.Item
    export let equipped: boolean = false
    export let noButton: boolean = false
    export let unequip: boolean = false
    export let empty: boolean = false
    export let hook: string = ""

    const dispatch = createEventDispatcher()
</script>

<div data-cy={hook} class="inventory-item {equipped ? 'equipped' : ''}">
    <img src={preview} alt="" />
    <Text hook="inventory-item-name">{name}</Text>
    <Text hook="inventory-item-type" muted>{kind}</Text>
    {#if !noButton}
        <Button
            hook="inventory-item-button"
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
            hook="button-unequip-inventory"
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
