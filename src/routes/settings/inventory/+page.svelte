<script lang="ts">
    import InventoryItem from "$lib/components/inventory/InventoryItem.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { InventoryKind } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { mock_frames } from "$lib/mock/inventory"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"

    initLocale()

    let user: User = get(Store.state.user)
</script>

<div id="page">
    <div class="equipped">
        <Label hook="label-inventory-equipped-items" text="Equipped Items" />
        <div class="items">
            <div class="item">
                <Label hook="label-inventory-frame" text="Frame" />
                <InventoryItem
                    hook="inventory-profile-picture-frame"
                    equipped={true}
                    kind={InventoryKind.Frame}
                    name={user.profile.photo.frame.name}
                    preview={user.profile.photo.frame.image}
                    noButton
                    unequip
                    empty={user.profile.photo.frame.image === ""}
                    on:apply={() => {
                        Store.unequipFrame()
                        user = get(Store.state.user)
                    }} />
            </div>
        </div>
    </div>
    <Label hook="label-inventory-frames" text="Frames" />
    <div class="frames">
        {#each mock_frames as frame}
            <InventoryItem
                hook="inventory-frame"
                equipped={user.profile.photo.frame.image === frame.image}
                kind={InventoryKind.Frame}
                name={frame.name}
                preview={frame.image}
                on:apply={() => {
                    Store.setFrame(frame)
                    user = get(Store.state.user)
                }} />
        {/each}
    </div>
    <Label hook="label-profile-overlays" text="Profile Overlays" />
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        padding: var(--padding);

        .frames {
            display: inline-flex;
            gap: var(--gap);
            flex-wrap: wrap;
        }

        .equipped {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);

            .items {
                display: inline-flex;
                gap: var(--gap);

                .item {
                    display: inline-flex;
                    flex-direction: column;
                    gap: var(--gap);
                }
            }
        }
    }
</style>
