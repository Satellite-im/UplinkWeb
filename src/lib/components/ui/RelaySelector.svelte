<script lang="ts">
    import { Icon, Text, Label, Button, Input, Spacer } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { RelayStore, type RelayState } from "$lib/state/wasm/relays"
    import Modal from "$lib/components/ui/Modal.svelte"
    import { get } from "svelte/store"
    import { _ } from "svelte-i18n"
    import Controls from "$lib/layouts/Controls.svelte"

    type onClose = () => {}
    export let close: onClose | undefined = undefined
    let changed = false
    let adding: boolean = false
    let editing: string | undefined = undefined
    let relaysBack: { [key: string]: RelayState } = get(RelayStore.state)
    let relays = { ...relaysBack }
    // There seems to be some import problems when refreshing and having the relay component on the page
    // We fetch it lazily here instead
    let warp: typeof import("$lib/wasm/WarpStore")
    let warpImport = async () => {
        if (!warp) warp = await import("$lib/wasm/WarpStore")
        return warp
    }
    RelayStore.state.subscribe(s => {
        relaysBack = s
        relays = { ...s }
    })

    let nameToAdd: string = ""
    let relayToAdd: string = ""
    let addressError = false
    let nameError = false

    async function saveAndUpdate() {
        const WarpStore = (await warpImport()).WarpStore
        RelayStore.update(relays)
        let tesseract = get(WarpStore.warp.tesseract)
        if (tesseract && tesseract !== null) {
            WarpStore.initWarpInstances(
                Object.values(relays)
                    .filter(r => r.active)
                    .map(r => r.address),
                true
            )
        }
        changed = false
    }

    function add() {
        // Reset error states
        addressError = false
        nameError = false

        if (relayToAdd === "") {
            addressError = true
        }
        if (nameToAdd === "") {
            nameError = true
        }

        if (addressError || nameError) return

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
        let current = relays[name]
        if (current && current.default) return
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

    function getRelays(relays: { [x: string]: RelayState }) {
        // Return a sorted array where default relays are first, followed by alphabetic ordering of their names
        return Object.entries(relays).sort(([n, s], [n2, s2]) => {
            if (s.default === s2.default) {
                return n.localeCompare(n2)
            }
            return s.default ? -1 : 1
        })
    }
</script>

<div class="relay-selector">
    <Label hook="label-relay" text={$_("settings.network.relay.title")} />
    <Controls>
        <Button
            hook="button-relay-add"
            class="relay-add"
            appearance={Appearance.Success}
            text={$_("generic.add")}
            on:click={_ => {
                adding = true
            }}>
            <Icon icon={Shape.Plus} />
        </Button>
    </Controls>

    <div class="relay-content">
        {#if adding || editing}
            <Modal hook="modal-relay-add">
                <div class="relay-add-modal">
                    <Label hook="label-relay-name" text={$_("settings.network.relay.name")} />
                    <Input 
                        hook="input-relay-name" 
                        bind:value={nameToAdd}
                        on:input={() => { 
                            nameError = false
                        }}
                    ></Input>

                    {#if nameError}
                        <div class="error">{$_("settings.network.relay.name_required")}</div>
                    {/if}

                    {#if nameToAdd !== "" && !verifyName(nameToAdd)}
                        <div class="error">{$_("settings.network.relay.name_exist")}</div>
                    {/if}

                    <Label hook="label-relay-address" text={$_("settings.network.relay.address")} />

                    <Input 
                        hook="input-relay-address" 
                        bind:value={relayToAdd}
                        on:input={() => { 
                            addressError = false
                        }}
                        on:enter={add}
                    ></Input>

                    {#if addressError}
                        <div class="error">{$_("settings.network.relay.address_required")}</div>
                    {/if}

                    {#if relayToAdd !== "" && !verifyAddress(relayToAdd)}
                        <div class="error">{$_("settings.network.relay.invalid_address")}</div>
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
                                addressError = false
                                nameError = false
                            }}>
                            <Icon icon={Shape.XMark} />
                        </Button>
                        <Button 
                            hook="button-relay-modal-save" 
                            class="save" 
                            appearance={Appearance.Primary} 
                            on:click={add} 
                            text={$_("generic.add")}
                        >
                            <Icon icon={Shape.CheckMark} />
                        </Button>
                    </Controls>
                </div>
            </Modal>
        {/if}

        {#each getRelays(relays) as [name, relay]}
            <div class="relay-entry">
                <div class="relay-info">
                    <div>
                        <Label hook="label-relay-name" text={$_("settings.network.relay.name")} />
                        <Input hook="input-relay-name" value={name} disabled copyOnInteract />
                    </div>
                    <div>
                        <Label hook="label-relay-address" text={$_("settings.network.relay.address")} />
                        <Input hook="input-relay-address" value={relay.address} disabled copyOnInteract />
                    </div>
                </div>
                <Controls>
                    <Button
                        hook="button-relay-toggle"
                        class="relay-toggle"
                        appearance={!relay.active ? Appearance.Alt : Appearance.Primary}
                        on:click={_ => {
                            toggleRelay(name)
                        }}
                        text={relay.active ? $_("generic.enabled") : $_("generic.enable")}>
                        {#if relay.active}
                            <Icon icon={Shape.CheckMark} />
                        {/if}
                    </Button>
                    {#if !relay.default}
                        <Button
                            hook="button-relay-edit"
                            class="relay-edit"
                            appearance={Appearance.Alt}
                            on:click={_ => {
                                editing = name
                                nameToAdd = name
                                relayToAdd = relay.address
                                nameError = false
                                addressError = false
                            }}
                            text={$_("generic.edit")}>
                            <Icon icon={Shape.Pencil} />
                        </Button>
                        <Button
                            hook="button-relay-delete"
                            class="relay-delete"
                            appearance={Appearance.Error}
                            on:click={_ => {
                                deleteRelay(name)
                            }}
                            text={$_("generic.delete")}>
                            <Icon icon={Shape.Trash} />
                        </Button>
                    {/if}
                </Controls>
            </div>
        {/each}
        {#if changed}
            <div>
                <Text size={Size.Smaller}>{$_("generic.pending_changes")}</Text>
            </div>
        {/if}

        <Spacer />

        <Controls>
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

            :global(.controls) {
                width: fit-content;
                align-self: flex-end;
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
