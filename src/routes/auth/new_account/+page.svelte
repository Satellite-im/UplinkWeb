<script lang="ts">
    import { goto } from "$app/navigation"
    import { ProfilePicture } from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Button, Icon, Input, Label, Spacer, Text, Title } from "$lib/elements"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { Store } from "$lib/state/Store"
    import { get } from "svelte/store"
    import type { Identity } from "warp-wasm"
    import type { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { log } from "$lib/utils/Logger"

    let username = ""
    let statusMessage = ""

    initLocale()

    async function createAccount(username: string, statusMessage: string) {
        loading = true
        await MultipassStoreInstance.createIdentity(username, statusMessage, undefined)
        let identity = await MultipassStoreInstance.getOwnIdentity()
        identity.fold(
            (e: WarpError) => {
                log.error("Error creating identity: " + e)
            },
            async (identity: Identity) => {
                Store.setUserFromIdentity(identity!)
                await new Promise(resolve => setTimeout(resolve, 1000))
                setTimeout(() => MultipassStoreInstance.initMultipassListener(), 1000)
                loading = false
                goto(Route.Chat)
            }
        )
    }

    let loading = false
</script>

<div id="auth-recover">
    <div class="header">
        <Title hook="title-new-account">{$_("pages.auth.new_account.title")}</Title>
        <Text hook="text-new-account-secondary" muted>{$_("pages.auth.new_account.subtext")}</Text>
    </div>
    <div class="main">
        <div class="left">
            <ProfilePicture hook="profile-picture-new-account" size={Size.Large} image="/assets/moon.png" />
        </div>
        <div class="right">
            <Label hook="label-new-account-username" text={$_("generic.username")} />
            <Input
                hook="input-new-account-username"
                alt
                placeholder={$_("pages.auth.new_account.enter_username")}
                on:input={async e => {
                    username = e.detail
                }} />
            <Spacer less />
            <Label hook="label-new-account-status" text={$_("generic.status_message")} />
            <Input
                hook="input-new-account-status"
                alt
                placeholder={$_("pages.auth.new_account.set_status")}
                on:input={async e => {
                    statusMessage = e.detail
                }} />
        </div>
    </div>
    <Controls>
        <Button hook="button-new-account-go-back" class="full-width" text={$_("controls.go_back")} appearance={Appearance.Alt} loading={loading} on:click={() => goto(Route.RecoverySeed)}>
            <Icon icon={Shape.ArrowLeft} />
        </Button>
        <Button
            hook="button-new-account-create"
            class="full-width"
            text={$_("pages.auth.new_account.create")}
            loading={loading}
            on:click={async _ => {
                await createAccount(username, statusMessage)
            }}>
            <Icon icon={Shape.ArrowRight} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    #auth-recover {
        align-self: center;
        align-content: center;
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        padding: var(--padding);
        width: fit-content;
        max-width: var(--max-component-width);
        flex-wrap: wrap;
        flex: 1;

        .main {
            display: inline-flex;
            gap: var(--padding);
            flex: 100%;
            justify-content: center;
            background-color: var(--background-color);
            padding: var(--padding);
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius);
            flex-wrap: wrap;

            .left {
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .right {
                flex: 1;
                display: inline-flex;
                flex-direction: column;
                min-width: var(--min-component-width);
            }
        }

        .header {
            width: 100%;
            text-align: center;
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
        }
    }
</style>
