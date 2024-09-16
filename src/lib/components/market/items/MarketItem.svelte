<script lang="ts">
    import { Text, Icon, Button } from "$lib/elements"
    import Loader from "$lib/elements/Loader.svelte"
    import { Appearance, InventoryKind, Shape } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import { _ } from "svelte-i18n"

    export let name: string = ""
    export let preview: string = ""
    export let kind: InventoryKind = InventoryKind.Item
    export let empty: boolean = false
    export let hook: string = ""

    const dispatch = createEventDispatcher()
    let loaded = false

    function handleImageLoad() {
        loaded = true
    }
</script>

<div data-cy={hook} class="market-item">
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
    <Button
        hook="inventory-item-button"
        text="Purchase"
        fill
        on:click={() => {
            dispatch("apply")
        }}
        appearance={Appearance.Primary}>
        <Icon icon={Shape.Starlight} />
    </Button>
</div>

<style lang="scss">
    .market-item {
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
    }
</style>
