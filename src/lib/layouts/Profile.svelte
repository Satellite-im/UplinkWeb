<script lang="ts">
    import { ProfilePicture } from "$lib/components"
    import { Button, Icon, Input, Label, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import { Notes } from "$lib/utils/Notes"
    import { get } from "svelte/store"
    import { _ } from "svelte-i18n"
    import { getIntegrationColor, identityColor } from "$lib/utils/ProfileUtils"
    import { createEventDispatcher } from "svelte"

    export let user: User | null = null

    $: friends = Store.state.friends
    $: currentUserShortId = get(Store.state.user)?.id.short

    const dispatch = createEventDispatcher()
    function onClose() {
        dispatch("close")
    }

    function isFriended(targetUser: User) {
        return $friends.some(friend => friend === targetUser.key)
    }

    let note: string = user ? new Notes().get(user?.key) : ""
</script>

<div class="profile" data-cy="quick-profile">
    <div class="profile-header" data-cy="quick-profile-banner" style={`background-image: url(${user?.profile.banner.image}); background-color: ${identityColor(user?.key || "")};`}>
        <ProfilePicture hook="quick-profile-picture" id={user?.key} image={user?.profile.photo.image} size={Size.Larger} noIndicator status={user?.profile.status} frame={user?.profile.photo.frame} />

        <div class="details">
            <div class="left">
                <Label hook="label-quick-profile-username" text={$_("generic.username")} />
                <Text hook="text-quick-profile-username" size={Size.Large}>{user?.name}</Text>
            </div>
            <div class="right">
                {#if user && user.id.short !== currentUserShortId}
                    <Button hook="button-quick-profile-user" outline appearance={isFriended(user) ? Appearance.Alt : Appearance.Primary} text={isFriended(user) ? $_("settings.profile.friended") : $_("settings.profile.addFriend")}>
                        <Icon icon={isFriended(user) ? Shape.CheckMark : Shape.Plus} />
                    </Button>
                {/if}
            </div>
        </div>
    </div>
    {#if user}
        <div class="content">
            <div class="exit">
                <Button hook="button-quick-profile-exit" icon appearance={Appearance.Primary} on:click={_ => onClose()}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </div>
            <div class="section">
                <Label hook="label-quick-profile-status" text={$_("generic.status_message")} />
                <Text hook="text-quick-profile-status">{user.profile.status_message}</Text>
            </div>
            <div class="section">
                <Label text={$_("settings.profile.integration.title")} />
                <div class="integrations">
                    {#each user.integrations as integration}
                        <div class="integration" style={`border-color: ${getIntegrationColor(integration[0])};`}>
                            <img class="integration-logo" src="/assets/brand/{integration[0]}.png" alt="Platform Logo" />
                            <Text singleLine>{integration[1]}</Text>
                            <Button small icon appearance={Appearance.Alt} color={getIntegrationColor(integration[0])}>
                                <Icon icon={Shape.Popout} />
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="section">
                <Label hook="label-quick-profile-note" text={$_("settings.profile.note")} />
                <Input
                    hook="input-quick-profile-note"
                    alt
                    placeholder={$_("settings.profile.setNote")}
                    value={note}
                    on:input={e => {
                        if (user) new Notes().set(user?.key, e.detail)
                    }} />
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    .profile {
        height: 100%;
        max-height: 600px;
        overflow-y: scroll;
        width: var(--profile-width);
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: var(--gap);
        padding: var(--padding);
        margin-right: var(--gap-less);
        position: relative;

        .exit {
            position: absolute;
            top: var(--padding);
            right: var(--padding);
        }

        .section {
            display: inline-flex;
            flex-direction: column;
            .integrations {
                display: inline-flex;
                flex-wrap: wrap;
                gap: var(--gap-less);
                .integration {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--gap);
                    border-radius: var(--border-radius);
                    border: var(--border-width) solid var(--success-color);
                    overflow: hidden;
                    max-width: 200px;
                    padding: var(--padding-minimal);
                    .integration-logo {
                        width: 25px;
                    }
                }
            }
        }

        .profile-header {
            min-height: 256px;
            background-color: var(--background-alt);
            background-size: cover;
            background-position: center;
            padding: var(--padding-less);
            width: 100%;
            border-radius: var(--border-radius);
            display: inline-flex;
            align-items: flex-end;
            justify-content: flex-start;
            margin-bottom: 5rem;
            position: relative;
            gap: var(--gap);

            .details {
                margin-bottom: -5rem;
                display: inline-flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }

            :global(.profile-picture) {
                margin-bottom: -5rem;
            }
        }

        .content {
            border-top: var(--border-width) solid var(--border-color);
            padding-top: var(--gap);
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
        }
    }
</style>
