<script lang="ts">
    import { ProfilePicture } from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Button, Icon, Input, Label, Spacer, Text, Title } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Store } from "$lib/state/Store"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { CommonInputRules } from "$lib/utils/CommonInputRules"
    import { LoginPage } from "$lib/layouts/login"

    export let page: LoginPage
    export let username = ""
    export let statusMessage = ""
    let isValidUsername = false
    let isValidStatusMessage = true

    initLocale()
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
                on:isValid={e => {
                    isValidUsername = e.detail
                }}
                rules={CommonInputRules.username}
                on:input={async e => {
                    username = e.detail
                }} />
            <Spacer less />
            <Label hook="label-new-account-status" text={$_("generic.status_message")} />
            <Input
                hook="input-new-account-status"
                alt
                placeholder={$_("pages.auth.new_account.set_status")}
                on:isValid={e => {
                    isValidStatusMessage = e.detail
                }}
                rules={CommonInputRules.statusMessage}
                on:input={async e => {
                    statusMessage = e.detail
                }} />
        </div>
    </div>
    <Controls>
        <Button hook="button-new-account-go-back" class="full-width" text={$_("controls.go_back")} appearance={Appearance.Alt} on:click={() => (page = LoginPage.EntryPoint)}>
            <Icon icon={Shape.ArrowLeft} />
        </Button>
        <Button
            hook="button-new-account-create"
            class="full-width"
            text={$_("pages.auth.new_account.create")}
            disabled={!isValidUsername || !isValidStatusMessage}
            on:click={async _ => {
                if (username === "") {
                    Store.addToastNotification(new ToastMessage("", "Select a username to proceed.", 2))
                    return
                }
                if (isValidUsername && isValidStatusMessage) {
                    page = LoginPage.Pin
                }
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
