<script lang="ts">
    import { ProfilePicture } from "$lib/components"
    import { Button, Icon, Input, Label, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import { Notes } from "$lib/utils/Notes"
    import { get } from "svelte/store"
    import { wallet } from "$lib/utils/Wallet"
    import { _ } from "svelte-i18n"

    export let user: User | null = null

    $: friends = Store.state.friends
    $: currentUserShortId = get(Store.state.user)?.id.short

    function isFriended(targetUser: User) {
        return $friends.some(friend => friend === targetUser.key)
    }

    let note: string = user ? new Notes().get(user?.name) : ""
</script>

<div class="profile">
    <div class="profile-header" style="background-image: url('{user?.profile.banner.image}')">
        <ProfilePicture id={user?.key} image={user?.profile.photo.image} size={Size.Large} status={user?.profile.status} frame={user?.profile.photo.frame} />
    </div>
    {#if user && user.id.short !== currentUserShortId}
        <Button outline appearance={isFriended(user) ? Appearance.Alt : Appearance.Primary} text={isFriended(user) ? $_("settings.profile.friended") : $_("settings.profile.addFriend")}>
            <Icon icon={isFriended(user) ? Shape.CheckMark : Shape.Plus} />
        </Button>
    {/if}
    <div class="section">
        <Label text={$_("generic.username")} />
        <Text size={Size.Large}>{user?.name}</Text>
    </div>
    <div class="section">
        <Label text={$_("generic.status_message")} />
        <Text>{user?.profile.status_message}</Text>
    </div>
    <div class="section">
        <Label text="Send BTC" />
        {#if user != null}
            {#each wallet.scan_for_addr(user.profile.status_message) as address}
                <Button on:click={async () => await wallet.btc.send(address, 100)}>{"send 100 sat to " + wallet.shorten_addr(address, 4)}</Button>
            {/each}
        {/if}
    </div>
    <div class="section">
        <Label text={$_("settings.profile.note")} />
        <Input
            alt
            placeholder={$_("settings.profile.setNote")}
            value={note}
            on:input={e => {
                if (user) new Notes().set(user?.name, e.detail)
            }} />
    </div>
</div>

<style lang="scss">
    .profile {
        height: 100%;
        width: var(--profile-width);
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: var(--gap);
        padding: var(--padding);

        .section {
            display: inline-flex;
            flex-direction: column;
        }

        .profile-header {
            height: calc(var(--profile-width) / 2);
            background-color: var(--background-alt);
            background-size: cover;
            padding: var(--padding-less);
            width: 100%;
            border-radius: var(--border-radius);
            display: inline-flex;
            align-items: flex-end;
            justify-content: center;
            margin-bottom: 4rem;
            position: relative;

            :global(.profile-picture) {
                margin-bottom: -4rem;
            }
        }
    }
</style>
