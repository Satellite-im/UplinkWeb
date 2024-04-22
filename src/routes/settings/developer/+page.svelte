<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { Appearance, Font } from "$lib/enums"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/store"
    import Button from "$lib/elements/Button.svelte"
    import { UIStore } from "$lib/state/ui"
    import { SettingsStore, clearState } from "$lib/state"
    import { ConversationStore } from "$lib/state/conversation";

    initLocale()

    let font: Font = get(UIStore.state.font)
</script>

<div id="page">
    <SettingSection name="Devmode" description="Disable devmode.">
        <Button
            appearance={Appearance.Alt}
            on:click={(_) => SettingsStore.toggleDevmode(false)}
            >
            Exit Devmode
        </Button>
    </SettingSection>
    
    <SettingSection name="Load Mock" description="Loads mock data into state.">
        <Button
            appearance={Appearance.Alt}
            on:click={(_) => {
                Store.load_mock_data()
                ConversationStore.loadMockData()    
            }}
            >
            Load Mock Data
        </Button>
    </SettingSection>

    <SettingSection name="Clear State" description="Reset the application state.">
        <Button
            appearance={Appearance.Alt}
            on:click={(_) => clearState()}
            >
            Clear State
        </Button>
    </SettingSection>


</div>

<style lang="scss">
    #page {
        display: flex;
        flex-direction: column;
        margin: 0;
        flex: 1;
        gap: var(--gap);
    }
</style>