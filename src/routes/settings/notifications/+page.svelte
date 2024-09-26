<script lang="ts">
    import { Switch } from "$lib/elements"

    import { SettingSection } from "$lib/layouts"
    import { SettingsStore, type ISettingsState } from "$lib/state"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"

    let settings: ISettingsState = get(SettingsStore.state)
    SettingsStore.state.subscribe((s: ISettingsState) => {
        settings = s
    })
</script>

<div id="page">
    <SettingSection hook="section-notifications-enabled" name={$_("settings.notifications.enabled")} description={$_("settings.notifications.enabledDescription")}>
        <Switch
            hook="switch-notifications-enabled"
            on={settings ? settings.notifications.enabled : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, notifications: { ...settings.notifications, enabled: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-notifications-friends" name={$_("settings.notifications.friends")} description={$_("settings.notifications.friendsDescription")}>
        <Switch
            hook="switch-notifications-friends"
            on={settings ? settings.notifications.friends : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, notifications: { ...settings.notifications, friends: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-notifications-messages" name={$_("settings.notifications.messages")} description={$_("settings.notifications.messagesDescription")}>
        <Switch
            hook="switch-notifications-messages"
            on={settings ? settings.notifications.messages : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, notifications: { ...settings.notifications, messages: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-notifications-settings" name={$_("generic.settings")} description={$_("settings.notifications.settingsDescription")}>
        <Switch
            hook="switch-notifications-settings"
            on={settings ? settings.notifications.settings : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, notifications: { ...settings.notifications, settings: on.detail } })
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
        padding: var(--padding);
    }
</style>
