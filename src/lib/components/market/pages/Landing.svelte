<script>
    import Label from "$lib/elements/Label.svelte"
    import Bundle from "../Bundle.svelte"
    import MarketItem from "../items/MarketItem.svelte"
    import defaultManifest from "$lib/cdn.json"
    import { InventoryKind } from "$lib/enums"
    const tempCDN = "https://cdn.deepspaceshipping.co"
</script>

<div class="landing">
    <Label text="Active Bundle" />
    <Bundle />
    <Label text="Your Weekly Items" />
    <div class="weekly-items">
        <MarketItem name={defaultManifest.frames.Moonlight[1].name} kind={InventoryKind.Frame} preview={`${tempCDN}${defaultManifest.frames.Moonlight[1].image}`} />
        <MarketItem name={defaultManifest.frames.Moonlight[2].name} kind={InventoryKind.Frame} preview={`${tempCDN}${defaultManifest.frames.Moonlight[2].image}`} />
        <MarketItem name={defaultManifest.frames.Moonlight[3].name} kind={InventoryKind.Frame} preview={`${tempCDN}${defaultManifest.frames.Moonlight[3].image}`} />
        <MarketItem name={defaultManifest.frames.Moonlight[4].name} kind={InventoryKind.Frame} preview={`${tempCDN}${defaultManifest.frames.Moonlight[4].image}`} />
    </div>
</div>

<style lang="scss">
    .landing {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        max-width: 900px;
        min-width: var(--min-component-width);
        .weekly-items {
            max-width: 100%;
            display: inline-flex;
            flex-wrap: wrap;
            gap: var(--gap);
        }
    }
</style>
