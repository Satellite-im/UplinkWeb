<script lang="ts">
    import Icon from "$lib/elements/Icon.svelte"
    import Text from "$lib/elements/Text.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { User } from "$lib/types"
    import { createEventDispatcher } from "svelte"
    import ProfilePicture from "./ProfilePicture.svelte"

    export let users: User[]
    export let size: Size = Size.Medium
    export let forceSize: boolean = false

    const dispatch = createEventDispatcher()

    function getSize(index: number) {
        if (forceSize) {
            return size
        }

        switch (index) {
            case 0:
                return Size.Small
            case 1:
                return Size.Smaller
            case 2:
                return Size.Smallest
            default:
                return Size.Smallest
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="profile-picture-many" data-cy="profile-picture-many" on:click={_ => dispatch("click")}>
    {#each users as user, i}
        {#if i < 3}
            <ProfilePicture hook="profile-picture-many-single-pic" id={user.key} size={getSize(i)} image={user.profile.photo.image} status={user.profile.status} noIndicator />
        {/if}
    {/each}
    <div class="count">
        <Icon icon={Shape.Users} size={Size.Smaller} alt />
        <Text hook="profile-picture-many-length" size={Size.Smaller} appearance={Appearance.Alt}>
            {users.length}
        </Text>
    </div>
</div>

<style lang="scss">
    .profile-picture-many {
        height: var(--profile-picture-size);
        width: var(--profile-picture-size);
        position: relative;

        .count {
            position: absolute;
            right: 0;
            bottom: 0;
            background-color: var(--primary-color);
            padding: 1px var(--padding-minimal);
            border-radius: var(--border-radius);
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: var(--gap-less);
            z-index: 2;
            cursor: pointer;
        }

        :global(.profile-picture) {
            position: absolute;
            border: var(--border-width) solid var(--background);

            &:nth-child(1) {
                left: 0;
                z-index: 1;
            }

            &:nth-child(3) {
                bottom: 0.5rem;
                left: 0;
                z-index: 1;
            }

            &:nth-child(2) {
                top: 0.5rem;
                right: 0;
                z-index: 1;
            }
        }
    }
</style>
