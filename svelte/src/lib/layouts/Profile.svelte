<script lang="ts">
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Spacer from "$lib/elements/Spacer.svelte";
    import Text from "$lib/elements/Text.svelte";
    import { Appearance, Shape, Size } from "$lib/enums";
    import type { User } from "$lib/types";
    export let user: User | null = null;
</script>


<div class="profile">
    <div class="profile-header">
        <ProfilePicture image={user?.profile.photo.image} size={Size.Large} status={user?.profile.status} />
    </div>
    <Label text="Name" />
    <Text size={Size.Large}>{user?.name}</Text>
    <Spacer less />
    <Label text="Status Message" />
    <Text>{user?.profile.status_message}</Text>
    <Spacer less />
    <Label text="Note" />
    <Input alt placeholder="Set a note . . ."/>
</div>

<style lang="scss">
    .profile {
        height: 100%;
        width: var(--profile-width);
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: var(--gap-less);
        padding: var(--padding);

        .profile-header {
            height: calc(var(--profile-width) / 1.5);
            background-color: var(--background-alt);
            background-image: url('$lib/assets/kumar.jpg');
            background-size: cover;
            padding: var(--padding-less);
            width: 100%;
            border-radius: var(--border-radius);
            display: inline-flex;
            align-items: flex-end;
            justify-content: center;
            margin-bottom: 4rem;
            position: relative;

            .control {
                position: absolute;
                top: 0;
                right: 0;
            }

            :global(.profile-picture) {
                margin-bottom: -4rem;
            }
        }
    }
</style>