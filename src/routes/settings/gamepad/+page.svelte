<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Spacer, Switch } from "$lib/elements"
    import { SettingSection } from "$lib/layouts"
    import GamepadListener from "$lib/components/ui/GamepadListener.svelte"
    import { AAR } from "$lib/components"
    import Text from "$lib/elements/Text.svelte"
    import { SettingsStore } from "$lib/state"
    initLocale()

    $: settings = SettingsStore.state
</script>

<div id="page">
    <SettingSection hook="section-gamepad-enabled" name={$_("settings.gamepad.enabled")} description={$_("settings.gamepad.enabledDescription")}>
        <Switch
            hook="switch-gamepad-oenabled"
            on={settings ? $settings.gamepad.enabled : true}
            on:toggle={on => {
                SettingsStore.update({ ...$settings, gamepad: { ...$settings.gamepad, enabled: on.detail } })
            }} />
    </SettingSection>
    <GamepadListener gui />
    <Spacer />
    <Text>Everything working? Test it out below.</Text>
    <AAR />
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
