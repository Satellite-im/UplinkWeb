<script lang="ts">
    import { _ } from "svelte-i18n"
    import { Appearance, Shape } from "$lib/enums"
    import { Button, Icon } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { SettingsStore } from "$lib/state"
    import { goto } from "$app/navigation"

    let clicked: number = 0

    function increment() {
        if (clicked < 9) {
            clicked++
        } else if (clicked === 9) {
            SettingsStore.toggleDevmode(true)
            goto("/settings/developer")
        }
    }
</script>

<div id="page">
    <SettingSection hook="section-about-header" name={$_("settings.about.name")} description="Uplink"></SettingSection>
    <SettingSection hook="section-about-version" name={$_("settings.about.version")} description="0.2.5">
        <Button hook="button-check-for-update" text={$_("settings.about.checkUpdate")} appearance={Appearance.Alt}>
            <Icon icon={Shape.Refresh} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-about-website" name={$_("settings.about.website")} description={$_("settings.about.websiteDescription")}>
        <Button hook="button-open-website" text={$_("settings.about.openWebsite")} appearance={Appearance.Alt} on:click={() => window.open("https://satellite.im/", "_blank")}>
            <Icon icon={Shape.Globe} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-about-open-source-code" name={$_("settings.about.openSource")} description={$_("settings.about.openSourceDescription")}>
        <Button hook="button-open-source-code" text={$_("settings.about.openSource")} appearance={Appearance.Alt} on:click={() => window.open("https://github.com/Satellite-im", "_blank")}>
            <Icon icon={Shape.Code} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-about-made-in" name={$_("settings.about.madeIn")} description={$_("settings.about.madeInDescription")}>
        <div data-cy="about-made-in-flags" class="flags"><span class="emoji">🇺🇸 🇮🇹 🇩🇪 🇵🇹 🇧🇷 🇺🇦 🇧🇾 🇯🇵 🇦🇺 🇮🇩 🇲🇽 🇨🇦</span></div>
    </SettingSection>
    <SettingSection hook="section-about-dev-mode" name={$_("settings.about.devMode")} description={$_("settings.about.devModeDescription")}>
        <Button hook="button-about-dev-mode" on:click={_ => increment()} icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Beaker} />
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

        .flags {
            font-size: var(--icon-size-large);
        }
    }
</style>
