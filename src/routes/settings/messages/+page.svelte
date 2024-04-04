<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { SettingSection } from "$lib/layouts"
    import { Switch } from "$lib/elements"
    import { Store, type ISettingsState, defaultSettings } from "$lib/state/Store"

    initLocale()

    let settings: ISettingsState = defaultSettings
    Store.state.settings.subscribe((s: ISettingsState) => {
        settings = s
    })
</script>

<div id="page">
    <SettingSection name="Convert to Emoji" description="Convert smileys and other symbols like <3 to ❤️">
        <Switch on={(settings) ? settings.messaging.convertEmoji : true} on:toggle={(on) => {
            Store.updateSettings({...settings, messaging: {...settings.messaging, convertEmoji: on.detail}})
        }}/>
    </SettingSection>
    <SettingSection name="Markdown Support" description="Enabled the rendering of Markdown within messaging.">
        <Switch on={(settings) ? settings.messaging.markdownSupport : true} on:toggle={(on) => {
            Store.updateSettings({...settings, messaging: {...settings.messaging, markdownSupport: on.detail}})
        }}/>
    </SettingSection>
    <SettingSection name="Spam/Bot Detection & Rejection" description="Enabled the automatic rejection of messages from known spam bots or scammers. This uses a public ledger that we reserve privately for 30 days to prevent bots detecting they have been blocked too quickly.">
        <Switch on={(settings) ? settings.messaging.spamRejection : true} on:toggle={(on) => {
            Store.updateSettings({...settings, messaging: {...settings.messaging, spamRejection: on.detail}})
        }}/>
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