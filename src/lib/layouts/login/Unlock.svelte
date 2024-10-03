<script lang="ts">
    import { Label } from "$lib/elements"
    import { Modal, PinInput } from "$lib/components"
    import { Appearance, Shape } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import { Text, Button, Icon } from "$lib/elements"
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import { mock_users } from "$lib/mock/users"
    import Spacer from "$lib/elements/Spacer.svelte"
    import { get } from "svelte/store"
    import RelaySelector from "$lib/components/ui/RelaySelector.svelte"
    import { Controls } from "$lib/layouts"
    import { AuthStore } from "$lib/state/auth"
    import { createEventDispatcher } from "svelte"
    import { SettingsStore } from "$lib/state"

    export let create: boolean = false

    const dispatch = createEventDispatcher()

    let loading = false
    let scramble = get(AuthStore.state).scramblePin
    let stayLoggedIn = get(AuthStore.state).stayLoggedIn

    let showAccounts = false
    let showConfigureRelay = false
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
                <Button hook="button-create-new-profile" text={$_("pages.auth.create.profile")} appearance={Appearance.Alt}>
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
        stayLoggedIn={stayLoggedIn}
        showSettings={false}
        on:submit={async e => {
            loading = true
            await new Promise(resolve => {
                dispatch("pin", { pin: e.detail, done: resolve })
            })
            loading = false
        }} />

    <div class="unlock-controls">
        <Controls>
            {#if get(SettingsStore.state).devmode}
                <Button tooltip={$_("pages.auth.changeUser")} hook="button-change-user" icon on:click={_ => (showAccounts = true)} appearance={Appearance.Alt}>
                    <Icon icon={Shape.Profile} />
                </Button>
            {/if}
            <Button tooltip={$_("pages.auth.relay")} hook="button-configure-relay" icon on:click={_ => (showConfigureRelay = true)} appearance={Appearance.Alt}>
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
