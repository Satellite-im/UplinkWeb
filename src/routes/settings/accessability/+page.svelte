<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { Font } from "$lib/enums"
    import { get } from "svelte/store"
    import { Store } from "$lib/state/store"
    import { UIStore } from "$lib/state/ui"

    initLocale()

    let font: Font = get(UIStore.state.font)
</script>

<div id="page">
    <SettingSection name={$_("settings.accessability.openDyslexic")} description={$_("settings.accessability.openDyslexicDescription")}>
        <Switch
            on={font === Font.OpenDyslexic}
            on:toggle={e => {
                if (e.detail) {
                    UIStore.setFont(Font.OpenDyslexic)
                } else {
                    UIStore.setFont(Font.Poppins)
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
