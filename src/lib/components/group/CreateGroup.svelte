<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import { type User } from "$lib/types"
    import { ProfilePicture } from "$lib/components"
    import { Button, Checkbox, Icon, Input, Label } from "$lib/elements"
    import Text from "$lib/elements/Text.svelte"
    import { _ } from "svelte-i18n"
    import { Store } from "$lib/state/Store"
    import Controls from "$lib/layouts/Controls.svelte"
    import { createEventDispatcher } from "svelte"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"

    export let embedded: boolean = false

    let name = ""
    let recipients: User[] = []
    let error = ""

    function update_recipients(recipient: User) {
        let new_recipient_list = recipients

        if (recipients.includes(recipient)) {
            new_recipient_list.splice(new_recipient_list.indexOf(recipient), 1)
        } else {
            new_recipient_list.push(recipient)
        }

        recipients = new_recipient_list
        error = "" // Clear error when recipients change
    }

    function contains_recipient(list: User[], recipient: User): boolean {
        return list.includes(recipient)
    }

    $: friends = Store.getUsers(Store.state.friends)
    const dispatch = createEventDispatcher()

    async function onCreate() {
        if (recipients.length === 0) { // Validate before creating group chat
            error = $_("chat.group.noMembers") || "Please select at least one member."
            return
        }

        let conversation = await RaygunStoreInstance.createGroupConversation(name, recipients)
        conversation.onSuccess(chat => {
            Store.setActiveChat(chat)
        })
        name = ""
        recipients = []
        dispatch("create")
    }
</script>

<div class="new-chat" data-cy="modal-create-group-chat">
    <div class="select-user">
        <Label hook="label-create-group-name" text={$_("chat.group.name")} />
        <Input hook="input-create-group-name" alt bind:value={name} />
        <Label hook="label-create-group-members" text={$_("chat.group.members")} />
        <div class="user-list">
            {#each recipients as recipient}
                <div class="mini-user">
                    <ProfilePicture id={recipient.key} size={Size.Smaller} noIndicator image={recipient.profile.photo.image} />
                    <Text singleLine size={Size.Small} appearance={Appearance.Alt}>
                        {recipient.name}
                    </Text>
                    <Button
                        small
                        outline
                        icon
                        on:click={_ => {
                            update_recipients(recipient)
                        }}>
                        <Icon icon={Shape.XMark} alt class="control" />
                    </Button>
                </div>
            {/each}
        </div>
        <Label hook="label-create-group-select-members" text={$_("chat.group.select")} />
        <div class="user-selection-list {embedded ? 'embedded' : ''}">
            {#each $friends as recipient}
                <button class="user" on:click={() => update_recipients(recipient)}>
                    <ProfilePicture id={recipient.key} size={Size.Small} image={recipient.profile.photo.image} status={recipient.profile.status} />
                    <div class="info">
                        <Text singleLine size={Size.Medium}>
                            {recipient.name}
                        </Text>
                        <Text singleLine muted>
                            {recipient.key}
                        </Text>
                    </div>
                    <Checkbox checked={contains_recipient(recipients, recipient)} />
                </button>
            {/each}
        </div>

        {#if error} <!-- Display error message -->
            <Text appearance={Appearance.Error} size={Size.Small}>
                {error}
            </Text>
        {/if}

        <Controls>
            <Button
                hook="button-create-group"
                text={$_("chat.group.create")}
                fill
                on:click={onCreate}>
                <Icon icon={Shape.ChatPlus} />
            </Button>
        </Controls>
    </div>
</div>

<style lang="scss">
    .new-chat {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        width: 100%;
        height: fit-content;
        position: relative;
        justify-content: center;
        flex: 1;
        max-width: var(--max-component-width);

        .select-user {
            min-height: fit-content;
            flex: 1;
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius-less);
            padding: var(--gap);
            gap: var(--gap);
            display: inline-flex;
            flex-direction: column;
            position: relative;
            user-select: none;

            .user-list {
                display: inline-flex;
                flex-wrap: wrap;
                gap: var(--gap-less);
                background-color: var(--alt-color);
                padding: var(--padding-less);
                border-radius: var(--border-radius);
                border: var(--border-width) solid var(--border-color);
                height: fit-content;
                min-height: var(--input-height);

                .mini-user {
                    display: inline-flex;
                    gap: var(--gap-less);
                    align-items: center;
                    background-color: var(--primary-color);
                    color: var(--color-alt);
                    border-radius: var(--border-radius-more);
                    max-width: 150px;
                    font-size: var(--font-size-smaller);
                    border: var(--border-width-more) solid var(--primary-color);
                    height: fit-content;
                }
            }

            .user-selection-list {
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap);
                min-height: var(--input-height);
                max-height: var(--min-scrollable-height);
                overflow-y: auto;
                overflow-x: hidden;
                padding-right: var(--padding-less);

                &.embedded {
                    flex: 1;
                    padding-right: unset;
                }
            }

            .user {
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
    }
</style>
