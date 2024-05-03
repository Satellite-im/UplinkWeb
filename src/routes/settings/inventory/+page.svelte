<script lang="ts">
    import InventoryItem from "$lib/components/inventory/InventoryItem.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { InventoryKind } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { mock_frames } from "$lib/mock/inventory"
    import { Store } from "$lib/state/store";
    import type { User } from "$lib/types";
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store";

    initLocale()

    let user: User = get(Store.state.user)
</script>

<div id="page">
    <Label text="Frames" />
    <div class="frames">
        {#each mock_frames as frame}
            <InventoryItem
                equipped={user.profile.photo.frame === frame.image}
                kind={InventoryKind.Frame}
                name={frame.name}
                preview={frame.image}
                on:apply={() => {
                    Store.setFrame(frame)
                    user = get(Store.state.user)
                }}
            />
        {/each}
    </div>
    <Label text="Profile Overlays" />
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: var(--padding);

        .frames {
            display: inline-flex;
            gap: var(--gap);
        }
    }
</style>