<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"

    import { SettingSection } from "$lib/layouts"
    import { _ } from "svelte-i18n"
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
