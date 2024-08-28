<script lang="ts">
    import { PopupButton } from "$lib/components"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import NumberInput from "$lib/elements/Input/NumberInput.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import ColorPicker from "svelte-awesome-color-picker"
    import { _ } from "svelte-i18n"
    import { writable } from "svelte/store"

    let hex = writable("#30ae03")
</script>

<div class="create-role">
    <Label text="Create a new role"></Label>
    <div class="form">
        <div class="form-control name">
            <Label text="Name"></Label>
            <Input placeholder="Role name" />
        </div>
        <div class="form-control">
            <Label text="Level"></Label>
            <NumberInput defaultValue={0} />
        </div>
        <div class="form-control">
            <Label text="Color"></Label>
            <PopupButton hook="primary-color-popup-button" name={$_("settings.preferences.pick")} color={$hex}>
                <ColorPicker textInputModes={["hex"]} isDialog={false} isAlpha={false} bind:hex={$hex} />
                <div slot="icon" class="control">
                    <Icon icon={Shape.Eyedropper} />
                </div>
            </PopupButton>
        </div>
        <div class="form-control">
            <Label text="Create"></Label>
            <Button text="Add" appearance={Appearance.Primary} disabled>
                <Icon icon={Shape.Plus} />
            </Button>
        </div>
    </div>
</div>

<style lang="scss">
    .create-role {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        padding-top: 0;

        .form {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);

            .name {
                flex: 100%;
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
</style>
