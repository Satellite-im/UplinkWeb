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
            <div class="keybind">
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

            .controls {
                display: inline-flex;
                gap: var(--gap);
            }
        }
    }
</style>