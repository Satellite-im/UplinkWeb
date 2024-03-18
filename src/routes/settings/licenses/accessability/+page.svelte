<script lang="ts">
    import Banner from "$lib/components/ui/Banner.svelte";
    import Key from "$lib/components/settings/Key.svelte";
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
    <SettingSection name="Open Dyslexic" description="Open Dyslexic may help some users who suffer from dyslexia, it's a custom font you can enable.">
        <Switch />
    </SettingSection>
</div>

<style lang="scss">
    #page {
        display: flex;
        flex-direction: column;
        margin: 0;
        flex: 1;
        gap: var(--gap);

        .keybind {
            display: inline-flex;
            gap: var(--gap);
            justify-content: space-between;

            .controls {
                display: inline-flex;
                gap: var(--gap);

                .binding {
                    display: inline-flex;
                    gap: var(--gap);
                }
            }
        }
    }
</style>