<script lang="ts">
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
    import { AuthStore } from "$lib/state/auth"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { Store } from "$lib/state/store"

    initLocale()

    let create = false
    let loading = false
    let scramble = get(AuthStore.state).scramblePin

    let showAccounts = false
    let showConfigureRelay = false

    async function auth(pin: string) {
        loading = true
        if (get(AuthStore.state).pin === pin || get(AuthStore.state).pin === "") {
            let addressed = Object.values(get(RelayStore.state))
                .filter(r => r.active)
                .map(r => r.address)
            await WarpStore.initWarpInstances(addressed)
            await TesseractStoreInstance.unlock(pin)
            let ownIdentity = await MultipassStoreInstance.getOwnIdentity()
            ownIdentity.fold(
                (_: any) => {
                    AuthStore.setStoredPin(pin)
                    goto(Route.NewAccount)
                },
                (_: any) => {
                    goto(Route.Pre)
                }
            )
        } else {
            Store.addToastNotification(new ToastMessage("", "Pin is wrong!", 2))
            loading = false
        }

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
