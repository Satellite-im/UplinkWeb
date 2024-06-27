<script lang="ts">
    import { Button, Icon } from "src/lib/elements"
    import { Appearance, Shape } from "src/lib/enums"
    import { initLocale } from "src/lib/lang"
    import { SettingSection } from "src/lib/layouts"
    import { _ } from "svelte-i18n"

    initLocale()
</script>

<div id="page">
    <SettingSection hook="section-licenses-uplink" name={$_("generic.uplink")} description={$_("settings.licenses.description")}>
        <Button hook="button-view-license" text={$_("settings.licenses.view")} appearance={Appearance.Alt} on:click={() => window.open("https://github.com/Satellite-im/UplinkWeb/blob/dev/LICENSE-MIT", "_blank")}>
            <Icon icon={Shape.Document} />
        </Button>
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
