<script lang="ts">
    import { Label } from "$lib/elements"
    import { Modal } from "$lib/components"
    import { Appearance, Route, Shape } from "$lib/enums"

    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Text, Button, Icon } from "$lib/elements"
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import { mock_users } from "$lib/mock/users"
    import Spacer from "$lib/elements/Spacer.svelte"
    import RelaySelector from "$lib/components/ui/RelaySelector.svelte"
    import { Controls } from "$lib/layouts"
    import { LoginPage } from "$lib/layouts/login"
    import { onMount } from "svelte"
    import { RelayStore } from "$lib/state/wasm/relays"
    import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
    import { AuthStore } from "$lib/state/auth"
    import { get } from "svelte/store"
    import { WarpStore } from "$lib/wasm/WarpStore"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { goto } from "$app/navigation"
    import { log } from "$lib/utils/Logger"

    initLocale()

    export let page: LoginPage

    onMount(async () => {
        let authentication = await AuthStore.getAuthentication()
        await TesseractStoreInstance.initTesseract()
        if (authentication.stayLoggedIn) {
            let addressed = Object.values(get(RelayStore.state))
                .filter(r => r.active)
                .map(r => r.address)
            await WarpStore.initWarpInstances(addressed)
            log.info("Stay logged in is enabled, unlocking")
            let result = await TesseractStoreInstance.unlock(authentication.pin)
            result.onSuccess(() => {
                setTimeout(() => MultipassStoreInstance.initMultipassListener(), 1000)
            })
            goto(Route.Chat)
        }
    })

    let loading = false

    let showAccounts = false
    let showConfigureRelay = false
</script>

<div id="auth-create">
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

    <div class="create-content">
        {#if loading}
            <Label text={$_("generic.loading")} />
        {:else}
            <Label hook="label-create-title" text={$_("pages.auth.create.title")} />
        {/if}
        <Text hook="text-create-description">
            {$_("pages.auth.create.description")}
        </Text>
        <Spacer />
        <Controls breakpoint={1000}>
            <Button text={$_("pages.auth.create.new")} hook="button-create-account" on:click={_ => (page = LoginPage.Username)} appearance={Appearance.Primary} />
            <Button text={$_("pages.auth.create.import")} hook="button-import-account" on:click={_ => (showConfigureRelay = true)} appearance={Appearance.Alt} />
        </Controls>
    </div>

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
    #auth-create {
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

        .create-content {
            display: flex;
            flex-direction: column;
            width: 40%;
            gap: var(--gap);
            background-color: var(--background-alt);
            border-radius: var(--border-radius);
            padding: var(--padding);
            border: var(--border-width) solid var(--border-color);

            .create-content {
                text-align: center;
            }

            :global(.controls) {
                align-self: center;
            }
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
