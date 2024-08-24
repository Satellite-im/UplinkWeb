<script lang="ts">
    import { Loader, Text } from "$lib/elements"
    import { defaultUser, type User } from "$lib/types"
    import { ProfilePicture } from ".."
    import Controls from "$lib/layouts/Controls.svelte"

    import { _ } from "svelte-i18n"
    import { Size } from "$lib/enums"

    export let friend: User = defaultUser
</script>

<div class="friend" data-cy="friend-{friend.name}">
    <ProfilePicture id={friend.key} hook="friend-profile-picture" size={Size.Small} loading={friend.loading} image={friend.profile.photo.image} status={friend.profile.status} />
    <div class="friend-name-container">
        <Text hook="friend-name" class="username" singleLine loading={friend.loading}>
            {friend.name}
        </Text>
    </div>
    <Controls>
        <slot name="controls"></slot>
    </Controls>
</div>

<style lang="scss">
    .friend {
        width: 100%;
        display: inline-flex;
        gap: var(--gap);
        align-items: center;

        :global(.username) {
            flex: 100%;
            display: inline-flex;
            width: 100%;
            min-width: 100px;
            max-width: 100%;
        }
        .friend-name-container {
            width: 100%;
        }
    }
</style>
