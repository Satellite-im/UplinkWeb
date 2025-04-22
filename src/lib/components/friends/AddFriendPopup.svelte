<script lang="ts">
    import { Icon, Label, Text } from "$lib/elements"
    import Button from "$lib/elements/Button.svelte"
    import { Store } from "$lib/state/Store"
    import { createEventDispatcher } from "svelte"
    import { _ } from "svelte-i18n"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import type { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { ToastMessage } from "$lib/state/ui/toast"

    export let friend: string
    $: user = Store.getUser(friend)

    const dispatcher = createEventDispatcher()

    function close() {
        dispatcher("close")
    }

    async function add() {
        let res = await MultipassStoreInstance.sendFriendRequest(friend)
        res.fold(
            (e: WarpError) => {
                Store.addToastNotification(new ToastMessage("", e, 3, Shape.XMark, Appearance.Error))
            },
            () => {
                Store.addToastNotification(new ToastMessage("", `Your request is making it's way!`, 3, Shape.CheckMark, Appearance.Success))
            }
        )
        close()
    }
</script>

<div class="add-friend-popup">
    <Label hook="label-create-group-name" text={$_("settings.profile.addFriend")} />
    <div class="user">
        <ProfilePicture id={$user.key} image={$user.profile.photo.image} noIndicator size={Size.Medium} loading={$user.key === "0x0"} />
        <div class="username">
            <Text singleLine class="username">{$user.name}</Text>
            <Text singleLine class="status">{$user.profile.status_message}</Text>
        </div>
    </div>
    <div class="button-group">
        <Button text={$_("generic.add")} appearance={Appearance.Default} on:click={add}>
            <Icon icon={Shape.Plus} />
        </Button>
        <Button text={$_("generic.cancel")} appearance={Appearance.Default} on:click={close}>
            <Icon icon={Shape.NoSymbol} />
        </Button>
    </div>
</div>

<style lang="scss">
    .add-friend-popup {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        border-radius: var(--border-radius);
        gap: var(--gap);
        .user {
            display: flex;
            width: 100%;
            gap: var(--gap);
        }
        .button-group {
            justify-content: center;
            display: flex;
            gap: var(--gap);
            margin-top: var(--padding-less);
        }
    }
</style>
