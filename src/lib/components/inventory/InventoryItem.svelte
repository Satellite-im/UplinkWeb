<script lang="ts">
    import { Text, Icon, Button } from "$lib/elements"
    import Loader from "$lib/elements/Loader.svelte"
    import { Appearance, InventoryKind, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import { _ } from "svelte-i18n"

    export let name: string = ""
    export let preview: string = ""
    export let kind: InventoryKind = InventoryKind.Item
    export let equipped: boolean = false
    export let noButton: boolean = false
    export let unequip: boolean = false
    export let empty: boolean = false
    export let hook: string = ""

    const dispatch = createEventDispatcher()
    let loaded = false

    function handleImageLoad() {
        loaded = true
    }
</script>

<div data-cy={hook} class="inventory-item {equipped ? 'equipped' : ''}">
    {#if empty}
        <img src="/assets/frames/empty.png" alt="" class="preview" />
    {:else}
        {#if !loaded}
            <Loader />
        {/if}
        <img src={preview} alt="" class="preview" on:load={handleImageLoad} style:display={loaded ? "block" : "none"} />
    {/if}
    <Text hook="inventory-item-name">{name}</Text>
    <Text hook="inventory-item-type" muted>{kind}</Text>
    {#if !noButton}
        <Button
            hook="inventory-item-button"
            text={equipped ? $_("inventory.equipped") : $_("inventory.equip")}
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
            text={empty ? $_("inventory.noFrame") : $_("inventory.unequip")}
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

<style lang="scss">
    .inventory-item {
        width: fit-content;
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        justify-content: center;
        align-items: center;
        gap: var(--gap-less);

        .preview {
            max-width: 180px;
        }
/* 

  This selector is intentionally kept for future use

        .loading-indicator {
            width: 180px;
            height: 180px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: var(--loading-background-color);
            color: var(--loading-text-color);
        }
*/

    }
</style>
