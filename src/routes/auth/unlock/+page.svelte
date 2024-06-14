<script lang="ts">
	import { clearState } from '$lib/state';
    import { Label } from "$lib/elements"
    import { Modal, PinInput } from "$lib/components"
    import { goto } from "$app/navigation"
    import { Appearance, Route, Shape } from "$lib/enums"

    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Text, Button, Icon } from "$lib/elements"
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import { mock_users } from "$lib/mock/users"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { WarpStore } from "$lib/wasm/WarpStore"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { get } from "svelte/store"
    import RelaySelector from "$lib/components/ui/RelaySelector.svelte"
    import { RelayStore } from "$lib/state/wasm/relays"
    import { Controls } from "$lib/layouts"
    import type { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { WarpInstance, type Identity } from "warp-wasm"
    import { Store } from "$lib/state/store"
    import { onMount } from "svelte"

    onMount(async () => {
        localStorage.removeItem('warp.tesseract.keypair')
        TesseractStoreInstance.clear()
        WarpStore.clear()
        if (localStorage.getItem('is_user_logged') === 'true') {
            await doAutoLoginIfUserExist()
            return
        }
    })

    initLocale()

    let create = false
    let loading = false
    let scramble = true

    let showAccounts = false
    let showConfigureRelay = false

    async function auth(pin: string) {
        loading = true
        await TesseractStoreInstance.unlock(pin)
        let tesseract = await TesseractStoreInstance.getTesseract()
        let addressed = Object.values(get(RelayStore.state))
            .filter(r => r.active)
            .map(r => r.address)
        await WarpStore.initWarpInstances(tesseract, addressed)
        let ownIdentity = await MultipassStoreInstance.getOwnIdentity()
        ownIdentity.fold(
            (_: any) => {
                localStorage.setItem('pin', pin.toString())
                localStorage.setItem('is_user_logged', 'true')
                goto(Route.NewAccount)
            },
            (_: any) => {
                goto(Route.Pre)
            }
        )
    }

    async function doAutoLoginIfUserExist() {
            // HACK(Lucas): Temp Solution to avoid clearing cache all time
            let username = localStorage.getItem('user_name')
            let statusMessage = localStorage.getItem('status_message')
            let pin = localStorage.getItem('pin')
            await TesseractStoreInstance.unlock(pin!)
            let tesseract = await TesseractStoreInstance.getTesseract()
            let addressed = Object.values(get(RelayStore.state))
                .filter(r => r.active)
                .map(r => r.address)
            await WarpStore.initWarpInstances(tesseract, addressed)
            await MultipassStoreInstance.createIdentity(username!, statusMessage!, undefined)
            let identity = await MultipassStoreInstance.getOwnIdentity()
            identity.fold(
                (e: WarpError) => {
                    get(Store.state.logger).error("Error creating identity: " + e)
                },
                async (identity: Identity) => {
                    Store.setUserFromIdentity(identity!)
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    loading = false
                    goto(Route.Chat)
                }
            )
    }

</script>

<div id="auth-unlock">
    {#if showAccounts}
        <Modal hook="modal-select-profile" on:close={_ => (showAccounts = false)} padded>
            <div class="profiles">
                <Label hook="label-select-profile" text={$_("generic.profiles")} />
                <div class="user" data-cy="select-profile-user">
                    <ProfilePicture hook="select-profile-user-image" image={mock_users[1].profile.photo.image} noIndicator />
                    <Text hook="select-profile-user-name" class="username">{mock_users[1].name}</Text>
                </div>
                <div class="user" data-cy="select-profile-user">
                    <ProfilePicture hook="select-profile-user-image" image={mock_users[2].profile.photo.image} />
                    <Text hook="select-profile-user-name" class="username">{mock_users[2].name}</Text>
                </div>
                <Spacer />
                <Button hook="button-create-new-profile" text="Create new profile" appearance={Appearance.Alt}>
                    <Icon icon={Shape.Plus} />
                </Button>
            </div>
        </Modal>
    {/if}

    {#if showConfigureRelay}
        <Modal hook="modal-select-relay" on:close={_ => (showConfigureRelay = false)} padded>
            <RelaySelector />
        </Modal>
    {/if}

    {#if loading}
        <Label text={$_("generic.loading")} />
    {:else}
        <Label text={create ? $_("pages.auth.unlock.choose_pin") : $_("pages.auth.unlock.enter_pin")} hook="label-choose-enter-pin" />
    {/if}

    <PinInput
        min={4}
        max={8}
        loading={loading}
        scramble={scramble}
        showSettings={false}
        on:submit={async e => {
            loading = true
            await auth(e.detail)
        }} />

    <div class="unlock-controls">
        <Controls>
            <Button tooltip="Change User" hook="button-change-user" icon on:click={_ => (showAccounts = true)} appearance={Appearance.Alt}>
                <Icon icon={Shape.Profile} />
            </Button>
            <Button tooltip="Configure Relay" hook="button-configure-relay" icon on:click={_ => (showConfigureRelay = true)} appearance={Appearance.Alt}>
                <Icon icon={Shape.Relay} />
            </Button>
        </Controls>
    </div>
</div>

<style lang="scss">
    #auth-unlock {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;
        padding: var(--padding);
        width: 100%;
        height: 100%;

        .unlock-controls {
            position: absolute;
            right: var(--padding);
            bottom: var(--padding);
        }

        .profiles {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
            width: 100%;
            min-width: var(--min-component-width);
            .user {
                display: inline-flex;
                gap: var(--gap);
                width: 100%;
                justify-content: flex-start;
                align-items: center;
                border: var(--border-width) solid transparent;
                padding: var(--padding-minimal);
                border-radius: var(--border-radius);
                cursor: pointer;

                &:hover {
                    background-color: var(--alt-color);
                }

                :global(.username) {
                    flex: 1;
                }
            }
        }
    }
</style>
