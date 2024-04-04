<script lang="ts">
    import { Banner, Key } from "$lib/components"
    import { Button, Icon, Spacer, Text } from "$lib/elements"
    import { Appearance, KeybindAction, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { SettingSection } from "$lib/layouts"
    import { Store } from "$lib/state/Store";
    import type { Keybind } from "$lib/types";
    import { _ } from 'svelte-i18n'

    initLocale()

    let keybinds: Keybind[] = []

    Store.state.settings.subscribe(settings => {
        keybinds = settings.keybinds
    })
</script>

<div id="page">
    <Banner text="Global keybinds are disabled while on this page.">
        <Icon icon={Shape.Info} size={Size.Large} />
    </Banner>
    <Spacer />
    <SettingSection name="Revert" description="Revert keybinds to default bindings.">
        <Button appearance={Appearance.Alt} text="Revert Keybinds">
            <Icon icon={Shape.UTurn} />
        </Button>
    </SettingSection>

    {#if keybinds}
        {#each keybinds as keybind}
            <div class="keybind">
                <Text>{keybind.action}</Text>
                <div class="controls">
                    <div class="binding">
                        {#each keybind.keys as key}
                            <Key character={key} />
                        {/each}
                    </div>
                    <Button icon appearance={Appearance.Alt}>
                        <Icon icon={Shape.UTurn} />
                    </Button>
                </div>
            </div>
        {/each}
    {/if}
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