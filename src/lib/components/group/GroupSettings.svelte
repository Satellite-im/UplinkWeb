<script lang="ts">
    import Label from "$lib/elements/Label.svelte"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import Input from "$lib/elements/Input/Input.svelte"
    import Spacer from "$lib/elements/Spacer.svelte"
</script>

<div class="settings">
    <Label text="Name" />
    <Input value="Group Name" />
    <Label text="Description" />
    <Input value="Group description goes here" />
    <Spacer />
    <Label text="Settings" />
    <SettingSection name="Add Members" description="Allow anyone to add members to the group">
        <Switch on />
    </SettingSection>
    <SettingSection name="Change Details" description="Allow anyone to change the name and motd of the group">
        <Switch />
    </SettingSection>
    <SettingSection name="Change Photo" description="Allow anyone to change the group photo">
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