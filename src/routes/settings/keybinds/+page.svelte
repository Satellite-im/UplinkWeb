<script lang="ts">
    import { Banner, Key } from "$lib/components"
    import KeyboardListener from "$lib/components/ui/KeyboardListener.svelte";
    import { Button, Icon, Label, Select, Spacer, Text } from "$lib/elements"
    import Input from "$lib/elements/Input/Input.svelte";
    import { Appearance, KeybindAction, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { SettingSection } from "$lib/layouts"
    import Controls from "$lib/layouts/Controls.svelte";
    import { Store, type ISettingsState, defaultKeybinds } from "$lib/state/Store";
    import type { Keybind } from "$lib/types";
    import { _ } from 'svelte-i18n'

    initLocale()

    let settings: ISettingsState
    let keybinds: Keybind[] = []
    let recordedAction: KeybindAction = KeybindAction.ToggleMute

    let keyboardRecording = { key: "", modifiers: [] }

    Store.state.settings.subscribe(settings => {
        keybinds = settings.keybinds
        settings = settings
    })

    function handleNewKeybind() {
        const newKeybinds = keybinds.map(keybind => {
            if (keybind.action === recordedAction) {
                return {
                    action: recordedAction,
                    key: keyboardRecording.key,
                    modifiers: keyboardRecording.modifiers
                }
            }
            return keybind
        })
           
        Store.updateSettings({...settings, keybinds: newKeybinds})

        keyboardRecording = { key: "", modifiers: [] }
    }

    function isKeybindMatching(recorded: any, keybind: any) {
        // Check if the main keys match
        if (recorded.key !== keybind.key) return false;

        // Check if all recorded modifiers are in the keybind's modifiers and vice versa
        const uniqueModifiers = new Set([...recorded.modifiers, ...keybind.modifiers]);
        for (let mod of uniqueModifiers) {
            if (recorded.modifiers.includes(mod) !== keybind.modifiers.includes(mod)) {
                return false;
            }
        }

        // If both checks pass, the keybinds match
        return true;
    }
</script>

<div id="page">
    <KeyboardListener on:event={(e) => keyboardRecording = e.detail} />

    <Banner text="Global keybinds are disabled while on this page.">
        <Icon icon={Shape.Info} size={Size.Large} />
    </Banner>
    
    <Spacer />
    <Label text="Record Keybind" />
    <Text>Press any combination of keys while on this page, then select the action you'd like to bind to this keyboard combo. Custom shortcuts will override default shortcuts. Not all actions have default shortcuts.</Text>
    <div class="new-keybind">
        <div class="recorded-keys">
            <Label text="Recorded Keys"></Label>
            <div class="binding">
                {#if keyboardRecording.key}
                    <Key character={keyboardRecording.key} />
                    {#each keyboardRecording.modifiers as modifier}
                        <Key character={modifier} />
                    {/each}
                {:else}
                    <Key character="Press a key or combo to record." />
                {/if}
            </div>
        </div>
        <div class="action">
            <Label text="Action"></Label>
            <Select alt bind:selected={recordedAction} options={keybinds.map(keybind => { 
                return { text: keybind.action.toString(), value: keybind.action.toString()}
            })}></Select>
        </div>
        <div>
            <Button 
                text="Save" 
                disabled={keyboardRecording.key === ""} 
                appearance={keyboardRecording.key !== "" ? Appearance.Success : Appearance.Alt}
                on:click={handleNewKeybind}></Button>
            <Button text="Cancel" appearance={Appearance.Alt} on:click={(_) => {
                keyboardRecording = { key: "", modifiers: [] }
            }}></Button>
        </div>
    </div>
    <Spacer />

    <SettingSection name="Revert" description="Revert keybinds to default bindings.">
        <Button appearance={Appearance.Alt} text="Revert Keybinds" on:click={(_) => {
             Store.updateSettings({...settings, keybinds: defaultKeybinds})
        }}>
            <Icon icon={Shape.UTurn} />
        </Button>
    </SettingSection>

    {#if keybinds}
        {#each keybinds as keybind}
            <div class="keybind {isKeybindMatching(keyboardRecording, keybind) ? "highlight" : ""}">
                <Text>{keybind.action}</Text>
                <div class="controls">
                    <div class="binding">
                        <Key character={keybind.key} />
                        {#each keybind.modifiers as modifier}
                            <Key character={modifier} />
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
            }

            .controls {
                display: inline-flex;
                gap: var(--gap);
            }
        }
    }
</style>