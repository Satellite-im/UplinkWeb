<script lang="ts">
    import { _ } from "svelte-i18n"
    import { Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { Font } from "$lib/enums"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import type { FontOption } from "$lib/types"
    let font: FontOption = get(UIStore.state.font)
</script>

<div id="page">
    <SettingSection hook="section-accessibility" name={$_("settings.accessibility.openDyslexic")} description={$_("settings.accessibility.openDyslexicDescription")}>
        <Switch
            hook="switch-accessibility-open-dyslexic"
            on={font.text === Font.OpenDyslexic}
            on:toggle={e => {
                if (e.detail) {
                    UIStore.setFont({ text: Font.OpenDyslexic, value: Font.OpenDyslexic })
                } else {
                    UIStore.setFont({ text: Font.Poppins, value: Font.Poppins })
                }
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
