<script lang="ts">
    import { PopupButton } from "$lib/components"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { Shape } from "$lib/enums"
    import type { Tag } from "$lib/types"
    import ColorPicker from "svelte-awesome-color-picker"
    import CommunityTag from "./CommunityTag.svelte"
    import { writable } from "svelte/store"
    import { _ } from "svelte-i18n"
    import { mockTags } from "$lib/mock/community"

    let tags: Tag[] = mockTags

    let tagName = ""
    let hex = writable("#30ae03")

    function addTag() {
        if (tagName.trim() && $hex.trim()) {
            tags = [...tags, { name: tagName, color: $hex }]
            tagName = "" // Reset input field
            hex.set("#30ae03") // Reset color picker
        }
    }

    function removeTag(index: number) {
        tags = tags.filter((_, i) => i !== index)
    }
</script>

<div class="community-tags">
    <div class="add-tag">
        <Label text="Add Tag" />
        <div class="section">
            <div class="section-control">
                <Label text="Name" />
                <Input placeholder="Name" bind:value={tagName} />
            </div>
            <div class="section-control">
                <Label text="Color"></Label>
                <PopupButton hook="primary-color-popup-button" name={$_("settings.preferences.pick")} color={$hex}>
                    <ColorPicker textInputModes={["hex"]} isDialog={false} isAlpha={false} bind:hex={$hex} />
                    <div slot="icon" class="control">
                        <Icon icon={Shape.Eyedropper} />
                    </div>
                </PopupButton>
            </div>
            <div class="section-control">
                <Label text="Create"></Label>
                <Button text="Add" on:click={addTag}>
                    <Icon icon={Shape.Plus} />
                </Button>
            </div>
        </div>
    </div>
    <div class="available-tags">
        <Label text="Available Tags" />
        <div class="tags">
            {#each tags as tag, index}
                <CommunityTag tag={tag} on:remove={() => removeTag(index)} editable />
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .community-tags {
        display: inline-flex;
        flex-direction: column;
        gap: var(--padding);
        .available-tags {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap-less);
            .tags {
                display: inline-flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: var(--gap-less);
            }
        }

        .add-tag {
            display: inline-flex;
            flex-direction: column;
            .section {
                display: inline-flex;
                flex-direction: row;
                gap: var(--gap);
                width: 100%;

                .section-control {
                    display: inline-flex;
                    flex-direction: column;
                    &:first-child {
                        flex: 1;
                    }

                    :global(.button-like) {
                        display: none;
                    }

                    :global(.wrapper) {
                        padding: 0;
                        margin: 0;
                    }

                    :global(.modal .body) {
                        min-width: unset;
                    }

                    :global(input) {
                        border-radius: var(--border-radius-minimal);
                        background-color: var(--alt-color) !important;
                        color: var(--color);
                    }
                }
            }
        }
    }
</style>
