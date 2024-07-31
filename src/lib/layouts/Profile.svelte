<script lang="ts">
    import { ProfilePicture } from "$lib/components"
    import { Button, Icon, Input, Label, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { User } from "$lib/types"
    import { Notes } from "$lib/utils/Notes"
    import { get } from "svelte/store"
    import { wallet } from "$lib/utils/Wallet"
    import { getIntegrationColor, identityColor, toIntegrationIconSrc } from "$lib/utils/ProfileUtils"

    export let user: User | null = null

    $: friends = Store.state.friends
    $: currentUserShortId = get(Store.state.user)?.id.short

    function isFriended(targetUser: User) {
        return $friends.some(friend => friend === targetUser.key)
    }

    let note: string = user ? new Notes().get(user?.name) : ""
</script>

<div class="profile">
    <div class="profile-header" style={`background-image: url(${user?.profile.banner.image}); background-color: ${identityColor(user?.key || "")};`}>
        <ProfilePicture id={user?.key} image={user?.profile.photo.image} size={Size.Larger} noIndicator status={user?.profile.status} frame={user?.profile.photo.frame} />

        <div class="details">
            <div class="left">
                <Label text="Username" />
                <Text size={Size.Large}>{user?.name}</Text>
            </div>
            <div class="right">
                {#if user && user.id.short !== currentUserShortId}
                    <Button outline appearance={isFriended(user) ? Appearance.Alt : Appearance.Primary} text={isFriended(user) ? "You're friends" : "Add Friend"}>
                        <Icon icon={isFriended(user) ? Shape.CheckMark : Shape.Plus} />
                    </Button>
                {/if}
            </div>
        </div>
    </div>
    {#if user}
        <div class="content">
            <div class="section">
                <Label text="Status Message" />
                <Text>{user.profile.status_message}</Text>
            </div>
            <div class="section">
                <Label text="Accounts" />
                <div class="integrations">
                    {#each user.integrations as [key, value]}
                        <div class="integration" style={`border-color: ${getIntegrationColor(key)};`}>
                            <img class="integration-logo" src={toIntegrationIconSrc(key)} alt="Platform Logo" />
                            <Text singleLine>{value}</Text>
                            <Button small icon appearance={Appearance.Alt} color={getIntegrationColor(key)}>
                                <Icon icon={Shape.Popout} />
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="section">
                <Label text="Send BTC" />
                {#if user != null}
                    {#each wallet.scan_for_addr(user.profile.status_message) as address}
                        <Button on:click={async () => await wallet.btc.send(address, 100)}>{"send 100 sat to " + wallet.shorten_addr(address, 4)}</Button>
                    {/each}
                {/if}
            </div>
            <div class="section">
                <Label text="Note" />
                <Input
                    alt
                    placeholder="Set a note . . ."
                    value={note}
                    on:input={e => {
                        if (user) new Notes().set(user?.name, e.detail)
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
