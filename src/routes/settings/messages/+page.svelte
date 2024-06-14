<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { Switch } from "$lib/elements"
    import { get } from "svelte/store"
    import { SettingsStore, type ISettingsState } from "$lib/state"

    initLocale()

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
    <SettingSection hook="section-spam-bot-detection" name={$_("settings.messages.compactMessaging")} description={$_("settings.messages.compactMessagingDescription")}>
        <Switch
            hook="checkbox-compact-messaging"
            on={settings.messaging.compact}
            on:toggle={on => {
                SettingsStore.update({ ...settings, messaging: { ...settings.messaging, compact: on.detail } })
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
