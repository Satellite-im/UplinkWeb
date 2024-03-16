<script lang="ts">
    import Banner from "$lib/components/Banner.svelte";
    import Key from "$lib/components/Key.svelte";
import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Spacer from "$lib/elements/Spacer.svelte";
    import Switch from "$lib/elements/Switch.svelte";
    import Text from "$lib/elements/Text.svelte";
    import { Appearance, KeybindAction, Shape } from "$lib/enums";
import { initLocale } from "$lib/lang"
    import SettingSection from "$lib/layouts/SettingSection.svelte";
    import { _ } from 'svelte-i18n'

    initLocale()


</script>

<div id="page">
    <SettingSection name="Enabled" description="Enable notifications for incoming calls, messages, and more.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Friends" description="Enable notifications for friend requests.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Messages" description="Enable notifications for incoming messages.">
        <Switch on />
    </SettingSection>
    <SettingSection name="Settings" description="Enable notifications for updates and important alerts.">
        <Switch />
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