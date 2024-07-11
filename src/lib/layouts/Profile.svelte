<script lang="ts">
    import { ProfilePicture } from "$lib/components"
    import { Button, Icon, Input, Label, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import { Notes } from "$lib/utils/Notes"
    import { get } from "svelte/store"

    export let user: User | null = null

    let friends: User[] = get(Store.state.friends)
    $: friends = get(Store.state.friends)
    $: currentUserShortId = get(Store.state.user)?.id.short

    function isFriended(targetUser: User) {
        return friends.some(friend => friend.id.short === targetUser.id.short)
    }

    let note: string = user ? new Notes().get(user?.name) : ""
</script>

<div class="profile">
    <div class="profile-header" style="background-image: url('{user?.profile.banner.image}')">
        <ProfilePicture id={user?.key} image={user?.profile.photo.image} size={Size.Large} status={user?.profile.status} frame={user?.profile.photo.frame} />
    </div>
    {#if user && user.id.short !== currentUserShortId}
        <Button outline appearance={isFriended(user) ? Appearance.Alt : Appearance.Primary} text={isFriended(user) ? "You're friends" : "Add Friend"}>
            <Icon icon={isFriended(user) ? Shape.CheckMark : Shape.Plus} />
        </Button>
    {/if}
    <div class="section">
        <Label text="Username" />
        <Text size={Size.Large}>{user?.name}</Text>
    </div>
    <div class="section">
        <Label text="Status Message" />
        <Text>{user?.profile.status_message}</Text>
    </div>
    <div class="section">
        <Label text="Note" />
        <Input
            alt
            placeholder="Set a note . . ."
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
