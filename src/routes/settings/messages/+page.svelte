<script lang="ts">
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { Switch } from "$lib/elements"
    import { get } from "svelte/store"
    import { SettingsStore, type ISettingsState } from "$lib/state"

    let settings: ISettingsState = get(SettingsStore.state)
    SettingsStore.state.subscribe((s: ISettingsState) => {
        settings = s
    })
</script>

<div id="page">
    <SettingSection hook="section-convert-to-emoji" name={$_("settings.messages.convertToEmoji")} description={$_("settings.messages.convertToEmojiDescription")}>
        <Switch
            hook="checkbox-convert-to-emoji"
            on={settings ? settings.messaging.convertEmoji : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, convertEmoji: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-markdown-support" name={$_("settings.messages.markdownSupport")} description={$_("settings.messages.markdownSupportDescription")}>
        <Switch
            hook="checkbox-markdown-support"
            on={settings ? settings.messaging.markdownSupport : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, markdownSupport: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-spam-bot-detection" name={$_("settings.messages.spamRejection")} description={$_("settings.messages.spamRejectionDescription")}>
        <Switch
            hook="checkbox-spam-bot-detection"
            on={settings ? settings.messaging.spamRejection : true}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, spamRejection: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-compact-messaging" name={$_("settings.messages.compactMessaging")} description={$_("settings.messages.compactMessagingDescription")}>
        <Switch
            hook="switch-compact-messaging"
            on={settings.messaging.compact}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, compact: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-siple-unreads" name={$_("settings.messages.simpleUnreads")} description={$_("settings.messages.simpleUnreadsDescription")}>
        <Switch
            hook="switch-siple-unreads"
            on={settings.messaging.simpleUnreads}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, simpleUnreads: on.detail } })
            }} />
    </SettingSection>
    <SettingSection hook="section-quick-chat" name={$_("settings.messages.quick")} description={$_("settings.messages.quickDescription")}>
        <Switch
            hook="switch-quick-chat"
            on={settings.messaging.quick}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, quick: on.detail } })
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
