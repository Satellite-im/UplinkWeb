<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { User } from "$lib/types"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { Text } from "$lib/elements"
    import Controls from "$lib/layouts/Controls.svelte"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Label from "$lib/elements/Label.svelte"

    export let members: User[] = []
    export let adminControls: boolean = false
</script>

<div class="members">
    <Label text={`${members.length} member(s)`} />
    {#each members as member}
        <div class="user">
            <ProfilePicture id={member.key} image={member.profile.photo.image} noIndicator size={Size.Small} />
            <div class="username">
                <Text singleLine class="username">{member.name}</Text>
            </div>
            {#if adminControls}
                <Controls>
                    <Button small icon appearance={Appearance.Alt} tooltip="Remove">
                        <Icon icon={Shape.XMark} />
                    </Button>
                </Controls>
            {/if}
        </div>
    {/each}
</div>

<style lang="scss">
    .members {
        display: inline-flex;
        flex-direction: column;
        padding: var(--padding);
        gap: var(--gap);

        .user {
            display: inline-flex;
            gap: var(--gap);
            align-items: center;

            .username {
                display: inline-flex;
                align-items: center;
                min-width: 150px;
            }
        }
    }
</style>
