<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Appearance, Shape } from "$lib/enums"
    import { Button, Icon } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { SettingsStore } from "$lib/state"
    import { goto } from "$app/navigation"

    initLocale()

    let clicked: number = 0

    function increment() {
        if (clicked < 10) {
            clicked++
        } else if (clicked >= 10) {
            SettingsStore.toggleDevmode(true)
            goto("/settings/developer")
        }
    }
</script>

<div id="page">
    <SettingSection hook="section-about-header" name="About" description="Uplink"></SettingSection>
    <SettingSection hook="section-about-version" name="Version" description="0.2.5">
        <Button hook="button-check-for-update" text="Check for Update" appearance={Appearance.Alt}>
            <Icon icon={Shape.Refresh} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-about-website" name="Website" description="Open a new browser window to our official website.">
        <Button hook="button-open-website" text="Open Website" appearance={Appearance.Alt} on:click={() => window.open("https://satellite.im/", "_blank")}>
            <Icon icon={Shape.Globe} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-about-open-source-code" name="Open Source Code" description="Open a new browser window to our open source repository.">
        <Button hook="button-open-source-code" text="Open Source Code" appearance={Appearance.Alt} on:click={() => window.open("https://github.com/Satellite-im", "_blank")}>
            <Icon icon={Shape.Code} />
        </Button>
    </SettingSection>
    <SettingSection hook="section-about-made-in" name="Made In" description="Our team is all over the world with different backgrounds and different day-to-day lives all working on a common goal to build this app.">
        <div data-cy="about-made-in-flags" class="flags"><span class="emoji">🇺🇸 🇮🇹 🇩🇪 🇵🇹 🇧🇷 🇺🇦 🇧🇾 🇯🇵 🇦🇺 🇮🇩 🇲🇽 🇨🇦</span></div>
    </SettingSection>
    <SettingSection hook="section-about-dev-mode" name="DevMode" description="Click 10 times to enable developer settings.">
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
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: var(--padding);

        .flags {
            font-size: var(--icon-size-large);
        }
    }
</style>
