<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import { _ } from 'svelte-i18n'

    initLocale()
</script>

<div id="page">
    <SettingSection name="Uplink" description="Both code and icons are under the MIT license.">
        <Button text="View License">
            <Icon icon={Shape.Document} />
        </Button>
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