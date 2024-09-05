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

    export let members: User[] = []
    export let adminControls: boolean = false

    let allRecipients: User[] = []
    let friends: User[] = [] // Initialize friends as an empty array

    function update_members(user: User) {
        let group_members = [...members]

        if (group_members.includes(user)) {
            group_members.splice(group_members.indexOf(user), 1)
        } else {
            group_members.push(user)
        }

        members = group_members
    }

    function remove_member(user: User) {
        let group_members = [...members]

        if (group_members.includes(user)) {
            group_members.splice(group_members.indexOf(user), 1)
        }

        members = group_members
    }

    function contains_user(list: User[], user: User): boolean {
        return list.includes(user)
    }

    // Ensure friends is always an array and handle potential errors
    $: {
        try {
            friends = Store.getUsers(Store.state.friends) || [] // Default to empty array if undefined
        } catch (error) {
            console.error("Error fetching friends from store:", error)
            friends = [] // Default to empty array if an error occurs
        }

        if (!Array.isArray(friends)) {
            friends = []
        }
    }

    // Combine members and friends without duplicates
    $: {
        try {
            const uniqueKeys = new Set()
            allRecipients = Array.from(
                new Set(
                    [...members, ...friends].filter(user => {
                        if (uniqueKeys.has(user.key)) {
                            return false
                        } else {
                            uniqueKeys.add(user.key)
                            return true
                        }
                    })
                )
            )
        } catch (error) {
            console.error("Error combining members and friends:", error)
            allRecipients = [] // Default to empty array if an error occurs
        }
    }
</script>

<div class="members">
    {#if adminControls}
        <Label hook="label-create-group-add-members" text={$_("chat.group.members")} />
        <div class="recipient-list">
            {#each members as recipient}
                <div class="mini-recipient">
                    <ProfilePicture size={Size.Smaller} noIndicator image={recipient.profile.photo.image} />
                    <Text singleLine size={Size.Small} appearance={Appearance.Alt}>
                        {recipient.name}
                    </Text>
                    <Button small icon on:click={() => remove_member(recipient)} appearance={Appearance.Alt}>
                        <Icon icon={Shape.XMark} alt class="control" />
                    </Button>
                </div>
            {/each}
        </div>
        <Label text={$_("chat.group.settings.edit")} />
        <div class="recipient-selection-list">
            {#each allRecipients as recipient (recipient.key)}
                <button class="recipient" on:click={() => update_members(recipient)}>
                    <ProfilePicture size={Size.Small} image={recipient.profile.photo.image} status={recipient.profile.status} />
                    <div class="info">
                        <Text singleLine size={Size.Medium}>
                            {recipient.name}
                        </Text>
                        <Text singleLine muted>
                            {recipient.key}
                        </Text>
                    </div>
                    <Checkbox checked={contains_user(members, recipient)} />
                </button>
            {/each}
        </div>
    {:else}
        <Label text={$_("chat.group.amount", { values: { amount: members.length } })} />
        {#each members as member}
            <div class="user">
                <ProfilePicture id={member.key} image={member.profile.photo.image} noIndicator size={Size.Small} />
                <div class="username">
                    <Text singleLine class="username">{member.name}</Text>
                </div>
            </div>
        {/each}
    {/if}
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
                padding-right: 0;
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
