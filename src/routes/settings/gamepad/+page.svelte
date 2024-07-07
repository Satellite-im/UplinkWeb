<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import GamepadListener from "$lib/components/ui/GamepadListener.svelte"

    initLocale()
</script>

<div id="page">
    <GamepadListener gui />
    <SettingSection hook="section-gamepad-enabled" name={$_("settings.gamepad.enabled")} description={$_("settings.gamepad.enabledDescription")}>
        <Switch hook="switch-gamepad-oenabled" />
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
