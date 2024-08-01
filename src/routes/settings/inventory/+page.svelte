<script lang="ts">
    import InventoryItem from "$lib/components/inventory/InventoryItem.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { InventoryKind } from "$lib/enums"

    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"
    import defaultManifest from "$lib/cdn.json"

    const tempCDN = "https://cdn.deepspaceshipping.co"

    let user: User = get(Store.state.user)

    const frames = defaultManifest.frames
</script>

<div id="page">
    <div class="equipped">
        <Label hook="label-inventory-equipped-items" text={$_("settings.inventory.equippedItems")} />
        <div class="items">
            <div class="item">
                <Label hook="label-inventory-frame" text={$_("settings.inventory.frame")} />
                <InventoryItem
                    hook="inventory-profile-picture-frame"
                    equipped={true}
                    kind={InventoryKind.Frame}
                    name={user.profile.photo.frame.name}
                    preview={`${tempCDN}${user.profile.photo.frame.image}`}
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
    <Label hook="label-inventory-frames" text={$_("settings.inventory.frames")} />
    <div class="frames">
        {#each Object.entries(frames) as [category, frameList]}
            <div class="frame-section">
                <Label text={category} />
                <div class="frame-items">
                    {#each frameList as frame}
                        <InventoryItem
                            hook="inventory-frame"
                            equipped={user.profile.photo.frame.image === frame.image}
                            kind={InventoryKind.Frame}
                            name={frame.name}
                            preview={`${tempCDN}${frame.image}`}
                            on:apply={() => {
                                Store.setFrame(frame)
                                user = get(Store.state.user)
                            }} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <Label hook="label-profile-overlays" text={$_("settings.inventory.overlays")} />
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
            display: flex;
            flex-direction: column;
            gap: var(--gap);

            .frame-section {
                display: inline-flex;
                flex-direction: column;

                gap: var(--gap);
                margin-bottom: var(--padding);
            }

            .frame-items {
                display: inline-flex;
                gap: var(--gap);
                flex-wrap: wrap;
            }
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
