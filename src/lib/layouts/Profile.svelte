<script lang="ts">
    import ProfilePicture from "$lib/components/ProfilePicture.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Input from "$lib/elements/Input.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Text from "$lib/elements/Text.svelte";
    import { Appearance, Shape, Size } from "$lib/enums";
    import type { User } from "$lib/types";
    export let user: User | null = null;
</script>


<div class="profile">
    <div class="profile-header">
        <ProfilePicture image={user?.profile.photo.image} size={Size.Large} status={user?.profile.status} />
    </div>
    <Button outline appearance={Appearance.Alt} text="You're Friends.">
        <Icon icon={Shape.CheckMark} />
    </Button>
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
        <Input alt placeholder="Set a note . . ."/>
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

            :global(.profile-picture) {
                margin-bottom: -4rem;
            }
        }
    }
</style>