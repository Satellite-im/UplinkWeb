<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import Select from "$lib/elements/Select.svelte"
    import Meter from "$lib/components/Meter.svelte"
    import Button from "$lib/elements/Button.svelte";
    import { Appearance, Shape } from "$lib/enums";
    import Icon from "$lib/elements/Icon.svelte";

    initLocale()

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