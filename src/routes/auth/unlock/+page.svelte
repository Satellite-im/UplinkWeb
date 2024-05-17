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
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"


    initLocale();

    let create = false;
    let loading = false;
    let scramble = true;

    let showAccounts = false;
</script>

<div id="auth-unlock">
    {#if showAccounts}
        <Modal on:close={(_) => (showAccounts = false)} padded>
            <div class="profiles">
                <Label text={$_("generic.profiles")} />
                <div class="user">
                    <ProfilePicture
                        image={mock_users[1].profile.photo.image}
                        noIndicator
                    />
                    <Text class="username">{mock_users[1].name}</Text>
                </div>
                <div class="user">
                    <ProfilePicture image={mock_users[2].profile.photo.image} />
                    <Text class="username">{mock_users[2].name}</Text>
                </div>
                <Spacer />
                <Button text="Create new profile" appearance={Appearance.Alt}>
                    <Icon icon={Shape.Plus} />
                </Button>
            </div>
        </Modal>
    {/if}

    {#if loading}
        <Label text={$_("generic.loading")} />
    {:else}
        <Label
            text={create
                ? $_("pages.auth.unlock.choose_pin")
                : $_("pages.auth.unlock.enter_pin")}
        />
    {/if}

    <PinInput
        min={4}
        max={8}
        {loading}
        {scramble}
        showSettings={false}
        on:submit={async (e) => {
            loading = true
            await TesseractStoreInstance.unlock(e.detail)
            let tesseract = await TesseractStoreInstance.getTesseract()
            await WarpStore.initWarpInstances(tesseract)
            let user = get(Store.state.user)
            if (user.name === "Unknown User") {
                console.log(user)
                let identityProfile = await MultipassStoreInstance.createIdentity('Satellite_user', undefined)
                Store.setUsername(identityProfile.identity().username())
                console.log(user)
            }
            goto(Route.Pre)
        }} />

    <div class="switch-profile">
        <Button
            tooltip="Change User"
            icon
            on:click={(_) => (showAccounts = true)}
        >
            <Icon icon={Shape.Profile} />
        </Button>
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

        .switch-profile {
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
