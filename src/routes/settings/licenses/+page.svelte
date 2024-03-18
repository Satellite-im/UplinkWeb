<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { SettingSection } from "$lib/layouts"
    import { _ } from 'svelte-i18n'

    initLocale()
</script>

<div id="page">
    <SettingSection name="Uplink" description="Both code and icons are under the MIT license.">
        <Button text="View License" appearance={Appearance.Alt}>
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
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: var(--padding);
    }
</style>