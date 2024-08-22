<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { Tag } from "$lib/types"
    import { createEventDispatcher } from "svelte"

    export let tag: Tag
    export let editable: boolean = false
    const dispatch = createEventDispatcher()

    function handleRemove() {
        dispatch("remove")
    }
</script>

<div class="tag" style={`border-color: ${tag.color}`}>
    <div class="name" style={`color: ${tag.color}`}>
        <Icon icon={Shape.Tag} style="color: {tag.color}" />
        <div class="text">
            {tag.name}
        </div>
    </div>
    {#if editable}
        <Button icon small appearance={Appearance.Transparent} on:click={handleRemove} class="remove-btn">
            <Icon icon={Shape.XMark} size={Size.Small} />
        </Button>
    {/if}
</div>

<style lang="scss">
    .tag {
        border: var(--border-width) solid var(--primary-color);
        border-radius: var(--border-radius-more);
        width: fit-content;
        display: inline-flex;
        align-items: center;
        position: relative;
        height: calc((var(--input-height) / 1.5) + (var(--border-width) * 2));

        .name {
            display: inline-flex;
            align-items: center;
            padding: 0 var(--padding-less);
            gap: var(--gap-less);
        }

        :global(.button) {
            display: none;
        }

        &:hover {
            :global(.button) {
                display: inline-flex;
            }
        }
    }
</style>
