<script lang="ts">
    import Label from "$lib/elements/Label.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { _ } from "svelte-i18n"
    import { ProfilePicture } from ".."
    import FileUploadButton from "../ui/FileUploadButton.svelte"
    import { Size } from "$lib/enums"
</script>

<div class="settings">
    <Label text={$_("chat.group.settings.photo")} />
    <div class="profile-picture-container">
        <ProfilePicture noIndicator size={Size.Large} />
        <FileUploadButton icon tooltip={$_("chat.group.settings.photo")} on:upload={async picture => {}} />
    </div>
    <Label text={$_("chat.group.settings.name")} />
    <Input value={$_("chat.group.settings.name.placeholder")} />
    <Label text={$_("chat.group.settings.description")} />
    <Input value={$_("chat.group.settings.description.placeholder")} />
    <Spacer />
    <Label text={$_("generic.settings")} />
    <SettingSection name={$_("chat.group.settings.add")} description={$_("chat.group.settings.add.description")}>
        <Switch on />
    </SettingSection>
    <SettingSection name={$_("chat.group.settings.details")} description={$_("chat.group.settings.details.description")}>
        <Switch />
    </SettingSection>
    <SettingSection name={$_("chat.group.settings.photo")} description={$_("chat.group.settings.photo.description")}>
        <Switch />
    </SettingSection>
</div>

<style lang="scss">
    .settings {
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--gap);

        .profile-picture-container {
            position: relative;
            width: fit-content;

            :global(.button) {
                position: absolute;
                bottom: calc(var(--padding-less) * -0.5);
                right: calc(var(--padding-less) * -0.5);
                z-index: 2;
            }
        }
    }
</style>
