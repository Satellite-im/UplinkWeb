<script lang="ts">
    import { _ } from "svelte-i18n"
    import { SettingSection } from "$lib/layouts"
    import { Appearance, CallEvent, Route } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import Button from "$lib/elements/Button.svelte"
    import { SettingsStore, clearState } from "$lib/state"
    import { ConversationStore } from "$lib/state/conversation"
    import { InventoryStore } from "$lib/state/inventory"
    import { goto } from "$app/navigation"
    import { log, LogLevel } from "$lib/utils/Logger"
    import { Select } from "$lib/elements"
    import { get } from "svelte/store"
    import WidgetBar from "$lib/components/widgets/WidgetBar.svelte"

    let settings = get(log.settings)
    log.settings.subscribe(s => {
        settings = s
    })
</script>

<div id="page">
    <WidgetBar />
    <SettingSection hook="section-devmode" name={$_("settings.about.devMode")} description={$_("settings.developer.disable")}>
        <Button
            hook="button-exit-devmode"
            appearance={Appearance.Alt}
            on:click={_ => {
                goto("/settings/about")
                SettingsStore.toggleDevmode(false)
            }}>{$_("settings.developer.disableButton")}</Button>
    </SettingSection>

    <SettingSection hook="section-load-mock" name={$_("settings.developer.loadMock")} description={$_("settings.developer.loadMockDescription")}>
        <Button
            hook="button-load-mock"
            appearance={Appearance.Alt}
            on:click={_ => {
                Store.loadMockData()
                ConversationStore.loadMockData()
                InventoryStore.loadMockData()
            }}>
            {$_("settings.developer.loadMockButton")}
        </Button>
    </SettingSection>

    <SettingSection hook="section-clear-state" name={$_("settings.developer.clearState")} description={$_("settings.developer.clearStateDescription")}>
        <Button
            hook="button-clear-state"
            appearance={Appearance.Alt}
            on:click={async _ => {
                await clearState()
                    .then(() => {
                        goto(Route.Unlock)
                        setTimeout(() => {
                            location.reload()
                        }, 500)
                    })
                    .catch(error => log.error(`Error deleting database: ${error}`))
            }}>{$_("settings.developer.clearStateButton")}</Button>
    </SettingSection>

    <SettingSection hook="section-test-voice" name={$_("settings.developer.testVoice")} description={$_("settings.developer.testVoiceDescription")}>
        <Button hook="button-test-voice" appearance={Appearance.Alt} on:click={_ => goto("/developer/debug/voice")}>{$_("settings.developer.testVoiceButton")}</Button>
    </SettingSection>

    <SettingSection hook="section-test-call" name="Mock Incoming Call" description="Start a mock call.">
        <Button hook="button-test-call" appearance={Appearance.Alt} on:click={_ => {}}>Start Mock Call</Button>
    </SettingSection>

    <SettingSection hook="section-logger-level" name={$_("settings.developer.loggerLevel")} description={$_("settings.developer.loggerLevelDescription")}>
        <Select
            hook="selector-current-logger-level-{settings.level}"
            options={[
                { text: LogLevel.Info, value: LogLevel.Info },
                { text: LogLevel.Developer, value: LogLevel.Developer },
                { text: LogLevel.Debug, value: LogLevel.Debug },
                { text: LogLevel.Warning, value: LogLevel.Warning },
                { text: LogLevel.Error, value: LogLevel.Error },
            ]}
            on:change={v => {
                switch (v.detail) {
                    case LogLevel.Info:
                        return log.settings.update(s => {
                            s.level = LogLevel.Info
                            return s
                        })
                    case LogLevel.Developer:
                        return log.settings.update(s => {
                            s.level = LogLevel.Developer
                            return s
                        })
                    case LogLevel.Debug:
                        return log.settings.update(s => {
                            s.level = LogLevel.Debug
                            return s
                        })
                    case LogLevel.Warning:
                        return log.settings.update(s => {
                            s.level = LogLevel.Warning
                            return s
                        })
                    case LogLevel.Error:
                        return log.settings.update(s => {
                            s.level = LogLevel.Error
                            return s
                        })
                }
            }}
            bind:selected={settings.level}>
        </Select>
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

        :global(.relay-selector > .relay-content) {
            background-color: var(--alt-color);
            padding: var(--padding);
        }
    }
</style>
