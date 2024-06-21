<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Navigation, SettingSection } from "$lib/layouts"
    import { Appearance, Route, SettingsRoute, Shape } from "$lib/enums"
    import { Store } from "$lib/state/store"
    import Button from "$lib/elements/Button.svelte"
    import { SettingsStore, clearState } from "$lib/state"
    import { ConversationStore } from "$lib/state/conversation"
    import { InventoryStore } from "$lib/state/inventory"
    import { goto } from "$app/navigation"
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
        <Button hook="button-clear-state" appearance={Appearance.Alt} on:click={_ => clearState()}>Clear State</Button>
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
