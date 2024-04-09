<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { Font } from "$lib/enums"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/Store"

    initLocale()

    let font: Font = get(Store.state.ui.font)
</script>

<div id="page">
    <SettingSection name={$_("settings.accessability.openDyslexic")} description={$_("settings.accessability.openDyslexicDescription")}>
        <Switch on={font === Font.OpenDyslexic} on:toggle={(e) => {
            if (e.detail) {
                Store.setFont(Font.OpenDyslexic)
            } else {
                Store.setFont(Font.Poppins)
            }
        }} />
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