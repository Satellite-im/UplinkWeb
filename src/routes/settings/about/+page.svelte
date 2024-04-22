<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { Appearance, Shape } from "$lib/enums"
    import { Button, Icon } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import { SettingsStore } from "$lib/state"

    initLocale()

    let clicked: number = 0

    function increment() {
        if (clicked < 10) {
            clicked ++
        } else  if (clicked >= 10) {
            SettingsStore.toggleDevmode(true)
        }
    }

</script>

<div id="page">
    <SettingSection name="About" description="Uplink">
    </SettingSection>
    <SettingSection name="Version" description="0.2.5">
        <Button text="Check for Update" appearance={Appearance.Alt}>
            <Icon icon={Shape.Refresh} />
        </Button>
    </SettingSection>
    <SettingSection name="Website" description="Open a new browser window to our official website.">
        <Button text="Open Website" appearance={Appearance.Alt}>
            <Icon icon={Shape.Globe} />
        </Button>
    </SettingSection>
    <SettingSection name="Open Source Code" description="Open a new browser window to our open source repository.">
        <Button text="Open Source Code" appearance={Appearance.Alt}>
            <Icon icon={Shape.Code} />
        </Button>
    </SettingSection>
    <SettingSection name="Made In" description="Our team is all over the world with different backgrounds and different day-to-day lives all working on a common goal to build this app.">
        <div class="flags">
            🇺🇸 🇮🇹 🇩🇪 🇵🇹 🇧🇷 🇺🇦 🇧🇾 🇯🇵 🇦🇺 🇮🇩
        </div>
    </SettingSection>
    <SettingSection name="DevMode" description="Click 10 times to enable developer settings.">
        <Button on:click={(_) => increment()} icon appearance={Appearance.Alt}>
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