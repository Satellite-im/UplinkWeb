<script lang="ts">
    import { Icon, Text, Label, Button, Input } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { RelayStore, type RelayState } from "$lib/state/wasm/relays"
    import Modal from "$lib/components/ui/Modal.svelte"
    import { WarpStore } from "$lib/wasm/WarpStore"
    import { get } from "svelte/store"
    import { _ } from "svelte-i18n"
    import Controls from "$lib/layouts/Controls.svelte"

    type onClose = () => {}
    export let close: onClose | undefined = undefined
    let tesseract = get(WarpStore.warp.tesseract)
    let changed = false
    let adding: boolean = false
    let editing: string | undefined = undefined
    let relaysBack: { [key: string]: RelayState } = get(RelayStore.state)
    let relays = { ...relaysBack }
    RelayStore.state.subscribe(s => {
        relaysBack = s
        relays = { ...s }
    })

    let nameToAdd: string = ""
    let relayToAdd: string = ""

    function saveAndUpdate() {
        RelayStore.update(relays)
        if (tesseract && tesseract !== null) {
            WarpStore.initWarpInstances(
                tesseract,
                Object.values(relays)
                    .filter(r => r.active)
                    .map(r => r.address)
            )
        }
        changed = false
    }

    function add() {
        if (verifyName(nameToAdd) && verifyAddress(relayToAdd)) {
            let active = true
            if (editing) {
                active = relays[editing].active
                delete relays[editing]
            }
            relays[nameToAdd] = {
                active: active,
                address: relayToAdd,
            }
            changed = true
            nameToAdd = ""
            relayToAdd = ""
            adding = false
            editing = undefined
        }
    }

    function toggleRelay(name: string) {
        relays[name].active = !relays[name].active
        changed = true
    }

    function deleteRelay(name: string) {
        delete relays[name]
        relays = relays // Trigger update
        changed = true
    }

    function revert() {
        relays = { ...relaysBack }
        changed = false
    }

    function verifyName(name: string) {
        return (editing === name || !(name in relays)) && name !== ""
    }

    function verifyAddress(address: string) {
        return address !== "" && !address.includes(" ")
    }
</script>

<div class="relay-selector">
    <Label text={$_("settings.relay.title")} />
    <div class="relay-content">
        {#if adding || editing}
            <Modal>
                <div class="relay-add-modal">
                    <Label text={$_("settings.relay.name")} />
                    <Input bind:value={nameToAdd}></Input>
                    {#if nameToAdd !== "" && !verifyName(nameToAdd)}
                        <div class="error">{$_("settings.relay.name_exist")}</div>
                    {/if}
                    <Label text={$_("settings.relay.address")} />

                    <Input bind:value={relayToAdd} on:enter={add}></Input>
                    {#if relayToAdd !== "" && !verifyAddress(relayToAdd)}
                        <div class="error">{$_("settings.relay.invalid_address")}</div>
                    {/if}
                    <Controls>
                        <Button
                            text={$_("generic.cancel")}
                            class="cancel"
                            appearance={Appearance.Alt}
                            on:click={_ => {
                                nameToAdd = ""
                                relayToAdd = ""
                                adding = false
                                editing = undefined
                            }}>
                            <Icon icon={Shape.XMark} />
                        </Button>
                        <Button class="save" appearance={Appearance.Primary} on:click={add} text={$_("generic.add")}>
                            <Icon icon={Shape.CheckMark} />
                        </Button>
                    </Controls>
                </div>
            </Modal>
        {/if}
        {#each Object.entries(relays) as [name, relay]}
            <div class="relay-entry">
                <div class="relay-name" data-tooltip={relay.address}>
                    <Text>{name}</Text>
                </div>
                <Button icon class="relay-toggle" small appearance={!relay.active ? Appearance.Alt : Appearance.Success} on:click={_ => toggleRelay(name)}>
                    <Icon icon={Shape.CheckMark} />
                </Button>
                <Button
                    class="relay-edit"
                    small
                    appearance={Appearance.Alt}
                    on:click={_ => {
                        editing = name
                        nameToAdd = name
                        relayToAdd = relay.address
                    }}>
                    <Icon icon={Shape.Preferences} />
                </Button>
                <Button icon class="relay-delete" small appearance={Appearance.Alt} on:click={_ => deleteRelay(name)}>
                    <Icon icon={Shape.Trash} />
                </Button>
            </div>
        {/each}
        {#if Object.entries(relays).length > 0}
            <hr />
        {/if}
        {#if changed}
            <div>
                <Text size={Size.Smaller}>{$_("generic.pending_changes")}</Text>
            </div>
        {/if}

        <div class="controls">
            <Button
                class="relay-add"
                appearance={Appearance.Alt}
                text={$_("generic.add")}
                on:click={_ => {
                    adding = true
                }}>
                <Icon icon={Shape.Plus} />
            </Button>
            <div class="filling"></div>
            <Button icon class="revert" appearance={Appearance.Alt} tooltip={$_("generic.undo")} on:click={revert}>
                <Icon icon={Shape.UTurn} />
            </Button>
            <Button
                icon
                class="relay-save"
                appearance={Appearance.Alt}
                tooltip={$_("generic.save")}
                on:click={_ => {
                    if (changed) {
                        saveAndUpdate()
                    }
                }}>
                <Icon icon={Shape.CheckMark} />
            </Button>
            {#if close}
                <Button
                    icon
                    class="cancel"
                    appearance={Appearance.Alt}
                    tooltip={$_("generic.cancel")}
                    on:click={_ => {
                        close()
                    }}>
                    <Icon icon={Shape.NoSymbol} />
                </Button>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .relay-selector {
        width: 100%;
        // padding: var(--padding);
        display: flex;
        flex-direction: column;
        gap: var(--gap);

        :global(.title) {
            color: var(--color-muted);
            padding-bottom: var(--padding-less);
        }

        hr {
            width: 100%;
            height: 0;
        }

        .relay-entry {
            display: flex;
            gap: var(--gap);
            .relay-name {
                width: 100%;
                position: relative;
                &:before {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: calc(100% + var(--gap));
                    white-space: nowrap;
                    width: fit-content;
                    padding: var(--padding-minimal) var(--padding-less);
                    border-radius: var(--border-radius-minimal);
                    border: var(--border-width) solid var(--border-color);
                    color: var(--color);
                    font-size: var(--font-size-smaller);
                    text-align: center;
                    opacity: 0;
                    pointer-events: none;
                    z-index: 2;
                    transition: all var(--animation-speed);
                    background-color: var(--opaque-color);
                    backdrop-filter: blur(var(--blur-radius));
                    -webkit-backdrop-filter: blur(var(--blur-radius));
                }
                &:hover:before {
                    opacity: 1;
                }
            }
        }

        .controls {
            display: flex;
            gap: var(--gap-less);
        }

        .filling {
            width: 100%;
        }

        .error {
            font-size: var(--font-size-smallest);
            color: var(--error-color);
        }

        .relay-add-modal {
            display: flex;
            flex-direction: column;
            gap: var(--gap-less);
            padding: var(--padding);
            border-radius: var(--border-radius);
        }
    }
</style>
