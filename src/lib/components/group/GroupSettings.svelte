<script lang="ts">
    import Label from "$lib/elements/Label.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { _ } from "svelte-i18n"
</script>

<div class="settings">
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
    }
</style>
