<script lang="ts">
    import { Switch } from "$lib/elements"
    import { initLocale } from "$lib/lang"
    import { SettingSection } from "$lib/layouts"
    import type { ISettingsState } from "$lib/state/inital"
    import { Store} from "$lib/state/store"
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"

    initLocale()

    let settings: ISettingsState = get(Store.state.settings)
    Store.state.settings.subscribe((s: ISettingsState) => {
        settings = s
    })
</script>

<div id="page">
    <SettingSection name={$_("settings.notifications.enabled")} description={$_("settings.notifications.enabledDescription")}>
        <Switch on={(settings) ? settings.notifications.enabled : true} on:toggle={(on) => {
            Store.updateSettings({...settings, notifications: {...settings.notifications, enabled: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name={$_("settings.notifications.friends")} description={$_("settings.notifications.friendsDescription")}>
        <Switch on={(settings) ? settings.notifications.friends : true} on:toggle={(on) => {
            Store.updateSettings({...settings, notifications: {...settings.notifications, friends: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name={$_("settings.notifications.messages")} description={$_("settings.notifications.messagesDescription")}>
        <Switch on={(settings) ? settings.notifications.messages : true} on:toggle={(on) => {
            Store.updateSettings({...settings, notifications: {...settings.notifications, messages: on.detail }})
        }} />
    </SettingSection>
    <SettingSection name={$_("settings.notifications.settings")} description={$_("settings.notifications.settingsDescription")}>
        <Switch on={(settings) ? settings.notifications.settings : true} on:toggle={(on) => {
            Store.updateSettings({...settings, notifications: {...settings.notifications, settings: on.detail }})
        }} />
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