<script lang="ts">
    import { Banner, Key } from "$lib/components"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte"
    import { Button, Icon, Label, Select, Spacer, Text } from "$lib/elements"
    import { Appearance, KeybindAction, KeybindState, Shape, Size } from "$lib/enums"

    import { SettingSection } from "$lib/layouts"
    import { defaultKeybinds, SettingsStore, type ISettingsState } from "$lib/state"
    import type { Keybind } from "$lib/types"
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"

    let settings: ISettingsState = get(SettingsStore.state)
    let keybinds: Keybind[] = defaultKeybinds
    let recordedAction: KeybindAction = KeybindAction.ToggleMute

    let keyboardRecording = { key: "", modifiers: [] }

    SettingsStore.state.subscribe(settings => {
        keybinds = settings.keybinds
        settings = settings
    })

    function handleNewKeybind() {
        const newKeybinds = keybinds.map(keybind => {
            if (keybind.action === recordedAction) {
                return {
                    action: recordedAction,
                    key: keyboardRecording.key,
                    modifiers: keyboardRecording.modifiers,
                    state: KeybindState.Pressed,
                }
            }
            return keybind
        })

        SettingsStore.update({ ...settings, keybinds: newKeybinds })

        keyboardRecording = { key: "", modifiers: [] }
    }

    function revertKeybind(actionToRevert: KeybindAction) {
        const defaultKeybind = defaultKeybinds.find(kb => kb.action === actionToRevert)
        if (!defaultKeybind) return

        const newKeybinds = keybinds.map(kb => {
            if (kb.action === actionToRevert) {
                return { ...defaultKeybind }
            }
            return kb
        })

        SettingsStore.update({ ...settings, keybinds: newKeybinds })
    }

    function isKeybindMatching(recorded: any, keybind: any) {
        // Check if the main keys match
        if (recorded.key !== keybind.key) return false

        // Check if all recorded modifiers are in the keybind's modifiers and vice versa
        const uniqueModifiers = new Set([...recorded.modifiers, ...keybind.modifiers])
        for (let mod of uniqueModifiers) {
            if (recorded.modifiers.includes(mod) !== keybind.modifiers.includes(mod)) {
                return false
            }
        }

        // If both checks pass, the keybinds match
        return true
    }

    $: {
        // Update the recordedAction to match the current key and modifiers
        const matchingKeybind = keybinds.find(keybind => isKeybindMatching(keyboardRecording, keybind))
        if (matchingKeybind) {
            recordedAction = matchingKeybind.action
        }
    }
</script>

<div id="page">
    <KeyboardListener on:event={e => (keyboardRecording = e.detail)} />

    <Banner text={$_("settings.keybinds.banner")}>
        <Icon icon={Shape.Info} size={Size.Large} />
    </Banner>

    <Spacer />
    <Label hook="label-record-keybind" text={$_("settings.keybinds.recordKeybind")} />
    <Text hook="text-keybind-instructions">{$_("settings.keybinds.instructions")}</Text>
    <div data-cy="section-new-keybind" class="new-keybind">
        <div class="recorded-keys">
            <Label hook="label-keybind-recorded-keys" text={$_("settings.keybinds.recordedKeys")}></Label>
            <div class="binding">
                {#if keyboardRecording.key}
                    {#each keyboardRecording.modifiers as modifier}
                        <Key character={modifier} />
                    {/each}
                    <Key character={keyboardRecording.key} />
                {:else}
                    <Key character={$_("settings.keybinds.pressAKey")} />
                {/if}
            </div>
        </div>
        <div class="action">
            <Label hook="label-keybind-action" text={$_("settings.keybinds.action")}></Label>
            <Select
                hook="selector-keybind-action"
                alt
                bind:selected={recordedAction}
                options={keybinds.map(keybind => {
                    return { text: keybind.action.toString(), value: keybind.action.toString() }
                })}></Select>
        </div>
        <div>
            <Button hook="button-keybind-save" text={$_("generic.save")} disabled={keyboardRecording.key === ""} appearance={keyboardRecording.key !== "" ? Appearance.Success : Appearance.Alt} on:click={handleNewKeybind}></Button>
            <Button
                hook="button-keybind-cancel"
                text={$_("generic.cancel")}
                appearance={Appearance.Alt}
                on:click={_ => {
                    keyboardRecording = { key: "", modifiers: [] }
                }}></Button>
        </div>
    </div>
    <Spacer />

    <SettingSection hook="section-keybind-revert" name={$_("settings.keybinds.revert")} description={$_("settings.keybinds.revertDescription")}>
        <Button
            hook="button-keybind-revert-all"
            appearance={Appearance.Alt}
            text={$_("settings.keybinds.revert_plural")}
            on:click={_ => {
                SettingsStore.update({ ...settings, keybinds: defaultKeybinds })
            }}>
            <Icon icon={Shape.UTurn} />
        </Button>
    </SettingSection>

    {#if keybinds}
        {#each keybinds as keybind}
            <div data-cy="keybind" class="keybind {isKeybindMatching(keyboardRecording, keybind) ? 'highlight' : ''}">
                <Text hook="text-keybind-action">{keybind.action}</Text>
                <div class="controls">
                    <div class="binding">
                        <Key character={keybind.key} />
                        {#each keybind.modifiers as modifier}
                            <Key character={modifier} />
                        {/each}
                    </div>

                    <Button
                        hook="button-keybind-revert-single"
                        icon
                        appearance={Appearance.Alt}
                        on:click={_ => {
                            revertKeybind(keybind.action)
                        }}>
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
        padding: var(--padding);

        .new-keybind {
            width: 100%;
            display: inline-flex;
            gap: var(--gap);
            justify-content: space-between;
            align-items: flex-end;

            .recorded-keys,
            .action {
                display: inline-flex;
                flex-direction: column;
            }

            .recorded-keys {
                flex: 1;
                .binding {
                    min-height: var(--input-height);
                }
            }
        }

        .binding {
            display: inline-flex;
            gap: var(--gap);
        }

        .keybind {
            display: inline-flex;
            gap: var(--gap);
            justify-content: space-between;
            border: var(--border-width) solid transparent;
            border-radius: var(--border-radius);
            padding: var(--padding-minimal);

            &.highlight {
                border: var(--border-width) solid var(--info-color);
                padding: var(--padding);
            }

            .controls {
                display: inline-flex;
                gap: var(--gap);
            }
        }
    }
</style>
