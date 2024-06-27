<script lang="ts">
    import { initLocale } from "src/lib/lang"
    import { _ } from "svelte-i18n"
    import { Navigation, SettingSection } from "src/lib/layouts"
    import { Appearance, Route, SettingsRoute, Shape } from "src/lib/enums"
    import { Store } from "src/lib/state/store"
    import Button from "src/lib/elements/Button.svelte"
    import { SettingsStore, clearState } from "src/lib/state"
    import { ConversationStore } from "src/lib/state/conversation"
    import { InventoryStore } from "src/lib/state/inventory"
    import { goto } from "$app/navigation"
    import { log } from "src/lib/utils/Logger"
    initLocale()
</script>

<div id="page">
    <SettingSection hook="section-devmode" name="Devmode" description="Disable devmode.">
        <Button
            hook="button-exit-devmode"
            appearance={Appearance.Alt}
            on:click={_ => {
                goto("/settings/about")
                SettingsStore.toggleDevmode(false)
            }}>Exit Devmode</Button>
    </SettingSection>

    <SettingSection hook="section-load-mock" name="Load Mock" description="Loads mock data into state.">
        <Button
            hook="button-load-mock"
            appearance={Appearance.Alt}
            on:click={_ => {
                Store.loadMockData()
                ConversationStore.loadMockData()
                InventoryStore.loadMockData()
            }}>
            Load Mock Data
        </Button>
    </SettingSection>

    <SettingSection hook="section-clear-state" name="Clear State" description="Reset the application state.">
        <Button hook="button-clear-state" appearance={Appearance.Alt} 
            on:click={async _ => {
                    await clearState().then(() => {
                        goto(Route.Unlock)
                        setTimeout(() => {
                            location.reload()
                        }, 500)
                    })
                    .catch((error) => log.error(`Error deleting database: ${error}`));
                }}>Clear State</Button>
    </SettingSection>

    <SettingSection hook="section-test-voice" name="Test Voice" description="Dev Voice">
        <Button hook="button-test-voice" appearance={Appearance.Alt} on:click={_ => goto("/developer/debug/voice")}>Voice Dev</Button>
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
