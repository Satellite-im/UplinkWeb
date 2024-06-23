<script lang="ts">
    import { Icon, Text, Label, Button, Input, Spacer } from "$lib/elements"
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
    <Label hook="label-relay" text={$_("settings.relay.title")} />
    <div class="relay-content">
        {#if adding || editing}
            <Modal hook="modal-relay-add">
                <div class="relay-add-modal">
                    <Label hook="label-relay-name" text={$_("settings.relay.name")} />
                    <Input hook="input-relay-name" bind:value={nameToAdd}></Input>
                    {#if nameToAdd !== "" && !verifyName(nameToAdd)}
                        <div class="error">{$_("settings.relay.name_exist")}</div>
                    {/if}
                    <Label hook="label-relay-address" text={$_("settings.relay.address")} />

                    <Input hook="input-relay-address" bind:value={relayToAdd} on:enter={add}></Input>
                    {#if relayToAdd !== "" && !verifyAddress(relayToAdd)}
                        <div class="error">{$_("settings.relay.invalid_address")}</div>
                    {/if}
                    <Controls>
                        <Button
                            hook="button-relay-modal-cancel"
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
                        <Button hook="button-relay-modal-save" class="save" appearance={Appearance.Primary} on:click={add} text={$_("generic.add")}>
                            <Icon icon={Shape.CheckMark} />
                        </Button>
                    </Controls>
                </div>
            </Modal>
        {/if}
        {#each Object.entries(relays) as [name, relay]}
            <div class="relay-entry">
                <div class="relay-info">
                    <div>
                        <Label hook="label-relay-name" text="Name" />
                        <Input hook="input-relay-name" value={name} disabled copyOnInteract />
                    </div>
                    <div>
                        <Label hook="label-relay-address" text="Address" />
                        <Input hook="input-relay-address" value={relay.address} disabled copyOnInteract />
                    </div>
                </div>
                <div>
                    <!-- note: This empty Label is for UI Alignment -->
                    <Label text="" />
                    <Controls>
                        <Button
                            hook="button-relay-toggle"
                            class="relay-toggle"
                            appearance={!relay.active ? Appearance.Alt : Appearance.Primary}
                            on:click={_ => toggleRelay(name)}
                            text={relay.active ? $_("generic.enabled") : $_("generic.enable")}>
                            {#if relay.active}
                                <Icon icon={Shape.CheckMark} />
                            {/if}
                        </Button>
                        <Button
                            hook="button-relay-edit"
                            class="relay-edit"
                            icon
                            appearance={Appearance.Alt}
                            on:click={_ => {
                                editing = name
                                nameToAdd = name
                                relayToAdd = relay.address
                            }}>
                            <Icon icon={Shape.Pencil} />
                        </Button>
                        <Button hook="button-relay-delete" icon class="relay-delete" appearance={Appearance.Alt} on:click={_ => deleteRelay(name)}>
                            <Icon icon={Shape.Trash} />
                        </Button>
                    </Controls>
                </div>
            </div>
        {/each}
        {#if changed}
            <div>
                <Text size={Size.Smaller}>{$_("generic.pending_changes")}</Text>
            </div>
        {/if}

        <Spacer />

        <Controls>
            <Button
                hook="button-relay-add"
                class="relay-add"
                appearance={Appearance.Alt}
                text={$_("generic.add")}
                on:click={_ => {
                    adding = true
                }}>
                <Icon icon={Shape.Plus} />
            </Button>
            <div class="filling"></div>
            {#if changed}
                <Button hook="button-relay-revert" icon class="revert" appearance={Appearance.Alt} tooltip={$_("generic.undo")} on:click={revert}>
                    <Icon icon={Shape.UTurn} />
                </Button>
                <Button
                    hook="button-relay-save"
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
            {/if}
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
        </Controls>
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

        .relay-entry {
            display: flex;
            gap: var(--gap);
            align-items: center;
            margin-bottom: var(--padding);

            .relay-info {
                width: 100%;
                min-width: var(--min-component-width);
                position: relative;
                display: inline-flex;
                gap: var(--gap);
                align-items: center;
                &:hover:before {
                    opacity: 1;
                }
            }
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
