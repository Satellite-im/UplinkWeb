<script lang="ts">
    import { Text } from "src/lib/elements"
    import { defaultUser, type User } from "src/lib/types"
    import { ProfilePicture } from ".."
    import Controls from "src/lib/layouts/Controls.svelte"
    import { initLocale } from "src/lib/lang"
    import { _ } from "svelte-i18n"
    import { Size } from "src/lib/enums"

    initLocale()

    export let friend: User = defaultUser
</script>

<div class="friend">
    <ProfilePicture size={Size.Small} image={friend.profile.photo.image} status={friend.profile.status} />
    <Text class="username" singleLine>
        {friend.name}
    </Text>
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
            min-width: fit-content;
            max-width: 100%;
        }
    }
</style>
