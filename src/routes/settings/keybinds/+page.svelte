<script lang="ts">
    import { Banner, Key } from "$lib/components"
    import { Button, Icon, Spacer, Text } from "$lib/elements"
    import { Appearance, KeybindAction, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { SettingSection } from "$lib/layouts"
    import { _ } from 'svelte-i18n'

    initLocale()

    let defaultKeybins = [
        {
            action: KeybindAction.IncreaseFontSize,
            keys: ["Ctrl", "Shift", "+"]
        },
        {
            action: KeybindAction.DecreaseFontSize,
            keys: ["Ctrl", "Shift", "-"]
        },
        {
            action: KeybindAction.ToggleMute,
            keys: ["Ctrl", "Shift", "M"]
        },
        {
            action: KeybindAction.ToggleDeafen,
            keys: ["Ctrl", "Shift", "D"]
        },
        {
            action: KeybindAction.OpenInspector,
            keys: ["Ctrl", "Shift", "I"]
        },
        {
            action: KeybindAction.ToggleDevmode,
            keys: ["Ctrl", "Shift", "D"]
        },
        {
            action: KeybindAction.FocusUplink,
            keys: ["Ctrl", "Shift", "U"]
        }
    ]

</script>

<div id="page">
    <Banner text="Global keybinds are disabled while on this page.">
        <Icon icon={Shape.Info} large />
    </Banner>
    <Spacer />
    <SettingSection name="Revert" description="Revert keybinds to default bindings.">
        <Button appearance={Appearance.Alt} text="Revert Keybinds">
            <Icon icon={Shape.UTurn} />
        </Button>
    </SettingSection>

    {#each defaultKeybins as keybind}
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