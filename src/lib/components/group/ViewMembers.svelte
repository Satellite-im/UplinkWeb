<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { User } from "$lib/types"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { Checkbox, Input, Text } from "$lib/elements"
    import Controls from "$lib/layouts/Controls.svelte"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { _ } from "svelte-i18n"
    import { Store } from "$lib/state/Store"

    let selected_users: Array<User> = []
    export let members: User[] = []
    export let adminControls: boolean = false

    function update_members(user: User) {
        let group_members = selected_users

        if (members.includes(user)) {
            group_members.splice(group_members.indexOf(user), 1)
        } else {
            group_members.push(user)
        }

        selected_users = group_members
    }

    function remove_member(user: User) {
        let group_members = members

        if (members.includes(user)) {
            group_members.splice(group_members.indexOf(user), 1)
        }

        members = group_members
    }

    function contains_user(list: User[], user: User): boolean {
        return list.includes(user)
    }

    $: friends = Store.getUsers(Store.state.friends)
</script>

<div class="members">
    {#if adminControls}
        <Label hook="label-create-group-add-members" text={$_("chat.group.settings.add")} />
        <div class="recipient-list">
            {#each selected_users as recipient}
                <div class="mini-recipient">
                    <ProfilePicture size={Size.Smallest} image={recipient.profile.photo.image} />
                    <Text singleLine size={Size.Small} appearance={Appearance.Alt}>
                        {recipient.name}
                    </Text>
                    <Button small outline icon on:click={() => remove_member(recipient)}>
                        <Icon icon={Shape.XMark} alt class="control" />
                    </Button>
                </div>
            {/each}
        </div>
        <Label text={$_("payments.selectRecipients")} />
        <div class="recipient-selection-list">
            {#each $friends.filter(friend => !members.some(member => member.key === friend.key)) as friend}
                <button class="recipient" on:click={() => update_members(friend)}>
                    <ProfilePicture size={Size.Small} image={friend.profile.photo.image} status={friend.profile.status} />
                    <div class="info">
                        <Text singleLine size={Size.Medium}>
                            {friend.name}
                        </Text>
                        <Text singleLine muted>
                            {friend.key}
                        </Text>
                    </div>
                    <Checkbox checked={contains_user(selected_users, friend)} />
                </button>
            {/each}
        </div>
        <Button appearance={Appearance.Primary} text={$_("chat.group.settings.add")}>
            <Icon icon={Shape.Plus} />
        </Button>
    {/if}
    <Label text={$_("chat.group.amount", { values: { amount: members.length } })} />
    {#each members as member}
        <div class="user">
            <ProfilePicture id={member.key} image={member.profile.photo.image} noIndicator size={Size.Small} />
            <div class="username">
                <Text singleLine class="username">{member.name}</Text>
            </div>
            {#if adminControls}
                <Controls>
                    <Button small icon appearance={Appearance.Alt} tooltip={$_("generic.remove")}>
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
                flex: 1;
            }
        }

        .recipient-list {
            display: inline-flex;
            flex-wrap: wrap;
            gap: var(--gap-less);
            background-color: var(--alt-color);
            padding: var(--padding-less);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
            height: fit-content;
            min-height: var(--input-height);

            .mini-recipient {
                display: inline-flex;
                gap: var(--gap-less);
                align-items: center;
                background-color: var(--info-color);
                color: var(--color-alt);
                padding-right: var(--padding-less);
                border-radius: var(--border-radius-more);
                max-width: 150px;
                font-size: var(--font-size-smaller);
                border: var(--border-width) solid var(--info-color);
                height: fit-content;
            }
        }

        .recipient-selection-list {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
            height: var(--min-scrollable-height);
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: var(--padding-less);
        }

        .recipient {
            display: inline-flex;
            gap: var(--gap);
            padding: var(--padding-less);
            padding-right: var(--padding);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-radius);
            align-items: center;
            width: 100%;
            background-color: var(--alt-color);
            user-select: none;
            position: relative;
            color: var(--color);
            text-align: left;
            cursor: pointer;

            :global(input[type="checkbox"]:checked::after) {
                content: "";
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                position: absolute;
                border-radius: var(--border-radius);
                border: var(--border-width) solid var(--info-color);
                pointer-events: none;
            }

            &:hover {
                background-color: var(--alt-color-alt);
            }

            .info {
                display: inline-flex;
                flex-direction: column;
                flex: 1;
                justify-content: center;
                overflow: hidden;
                pointer-events: none;
                user-select: none;
            }
        }
    }
</style>
