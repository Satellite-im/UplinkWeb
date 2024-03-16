<script lang="ts">
    import Switch from "$lib/elements/Switch.svelte"
    import { initLocale } from "$lib/lang"
    import SettingSection from "$lib/layouts/SettingSection.svelte";
    import { _ } from 'svelte-i18n'

    initLocale()
</script>

<div id="page">
    <SettingSection name="Enabled" description="Enable notifications for incoming calls, messages, and more.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Friends" description="Enable notifications for friend requests.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Messages" description="Enable notifications for incoming messages.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Settings" description="Enable notifications for updates and important alerts.">
        <Switch />
    </SettingSection>
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
    }
</style>