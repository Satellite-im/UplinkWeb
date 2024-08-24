<script lang="ts">
    import ProfilePicture from "$lib/components/profile/ProfilePicture.svelte"
    import { Label, Text, Icon, Button } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Controls from "$lib/layouts/Controls.svelte"
    import { mockCommunityMembers } from "$lib/mock/community"
    import { CommunityTag } from "$lib/components"
    import type { Member } from "$lib/types"
    import { getTimeAgo } from "$lib/utils/Functions"

    let members: Member[] = mockCommunityMembers
</script>

<div class="manage-members">
    <Controls>
        <Button text="Add Member" appearance={Appearance.Primary}>
            <Icon icon={Shape.Plus} />
        </Button>
        <Button text="Kick Selected" appearance={Appearance.Error}>
            <Icon icon={Shape.Trash} />
        </Button>
        <Button text="Ban Selected" appearance={Appearance.Error}>
            <Icon icon={Shape.Trash} />
        </Button>
    </Controls>

    <div class="member-list">
        <div class="member-header">
            <div class="column">
                <Label text="Members" />
            </div>
            <div class="column">
                <Label text="Join Date" />
            </div>
            <div class="column">
                <Label text="Roles" />
            </div>
            <div class="column">
                <Label text="Tags" />
            </div>
        </div>
        {#each members as member}
            <div class="member-row">
                <div class="column user">
                    <ProfilePicture size={Size.Smaller} id={member.user.key} image={member.user.profile.photo.image} noIndicator />
                    <div class="user-details">
                        <Text singleLine>{member.user.name}</Text>
                        <Text muted singleLine>{member.user.key}</Text>
                    </div>
                </div>
                <div class="column">
                    <Text>{getTimeAgo(member.meta.join)}</Text>
                </div>
                <div class="column">
                    {#each member.roles as role}
                        <Text color={role.color}>{role.name}</Text>
                    {/each}
                </div>
                <div class="column">
                    {#each member.tags as tag}
                        <CommunityTag tag={tag} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    .manage-members {
        .member-list {
            display: flex;
            flex-direction: column;

            .member-header {
                display: flex;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }

            .member-row {
                display: flex;
                flex: 1;
            }

            .column {
                display: inline-flex;
                gap: var(--gap-less);
                flex: 1;
                padding: var(--gap);
                width: 25%;
                overflow: hidden;
            }
        }
    }
</style>
