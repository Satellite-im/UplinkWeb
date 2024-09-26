<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import type { Chat, User } from "$lib/types"
    import ProfilePicture from "../profile/ProfilePicture.svelte"
    import { Checkbox, Input, Text } from "$lib/elements"
    import Controls from "$lib/layouts/Controls.svelte"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { _ } from "svelte-i18n"
    import { Store } from "$lib/state/Store"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { get } from "svelte/store"
    import { ToastMessage } from "$lib/state/ui/toast"

    export let members: User[] = []
    export let adminControls: boolean = false
    export let activeChat: Chat

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
        RaygunStoreInstance.addGroupParticipants(activeChat.id, [user.key])
    }

    function remove_member(user: User) {
        if (members.length < 3) {
            Store.addToastNotification(new ToastMessage("", `A group can not exist with one person`, 2))
            return
        }
        if (user.key === activeChat.creator) {
            Store.addToastNotification(new ToastMessage("", `You can not remove the group creator`, 2))
            return
        }

        let group_members = [...members]

        if (group_members.includes(user)) {
            group_members.splice(group_members.indexOf(user), 1)
        }

        members = group_members
        RaygunStoreInstance.removeGroupParticipants(activeChat.id, [user.key])
    }

    function contains_user(list: User[], user: User): boolean {
        return list.includes(user)
    }

    // Ensure friends is always an array and handle potential errors
    $: {
        try {
            friends = get(Store.getUsers(Store.state.friends)) || [] // Default to empty array if undefined
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

<div class="members" data-cy="group-chat-members">
    {#if adminControls}
        <Label hook="label-group-chat-members" text={$_("chat.group.members")} />
        <div class="recipient-list" data-cy="recipients-list">
            {#each members as recipient}
                <div class="mini-recipient" data-cy="mini-recipient">
                    <ProfilePicture hook="mini-recipient-profile-picture" size={Size.Smaller} noIndicator image={recipient.profile.photo.image} />
                    <Text hook="mini-recipient-name" singleLine size={Size.Small} appearance={Appearance.Alt}>
                        {recipient.name}
                    </Text>
                    <Button hook="mini-recipient-button" small icon on:click={() => remove_member(recipient)} appearance={Appearance.Alt}>
                        <Icon icon={Shape.XMark} alt class="control" />
                    </Button>
                </div>
            {/each}
        </div>
        <Label hook="label-edit-members" text={$_("chat.group.settings.edit")} />
        <div class="recipient-selection-list" data-cy="recipient-selection-list">
            {#each allRecipients as recipient (recipient.key)}
                <button data-cy="recipient-single" class="recipient" on:click={() => update_members(recipient)}>
                    <ProfilePicture hook="recipient-single-profile-picture" size={Size.Small} image={recipient.profile.photo.image} status={recipient.profile.status} />
                    <div data-cy="recipient-single-info" class="info">
                        <Text hook="recipient-single-name" singleLine size={Size.Medium}>
                            {recipient.name}
                        </Text>
                        <Text hook="recipient-single-key" singleLine muted>
                            {recipient.key}
                        </Text>
                    </div>
                    <Checkbox hook="recipient-single-checkbox" checked={contains_user(members, recipient)} />
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
