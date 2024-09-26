<script lang="ts">
    import { ChatType, Route, Size } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import { ProfilePicture, ProfilePictureMany } from "$lib/components"
    import { type Chat, type User } from "$lib/types"
    import { Store } from "$lib/state/Store"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { goto } from "$app/navigation"
    import StoreResolver from "../utils/StoreResolver.svelte"

    export let filter: string

    let loading = false
    $: chats = UIStore.state.chats
    $: userCache = Store.getUsersLookup($chats.map(c => c.users).flat())
    $: friends = Store.getUsers(Store.state.friends)

    let searched_chats: [Chat, string, User[]][] = []
    let searched_friends: [User, Chat | undefined][] = []

    export function filter_chat() {
        if (filter) {
            searched_chats = $chats
                .filter(c => c.kind == ChatType.Group)
                .map<[Chat, string, User[]]>(c => [c, get_chat_name(c), c.users.map(user => $userCache[user]).filter(u => u.name.toLocaleLowerCase().startsWith(filter.toLocaleLowerCase()))])
                .filter(entry => entry[1].toLocaleLowerCase().startsWith(filter.toLocaleLowerCase()) || entry[2].length > 0)
            searched_friends = $friends.filter(f => f.name.toLocaleLowerCase().startsWith(filter.toLocaleLowerCase())).map(f => [f, $chats.find(c => c.kind == ChatType.DirectMessage && c.users[0] === f.key)])
        } else {
            searched_chats = []
            searched_friends = []
        }
    }

    export function select_first() {
        if (searched_friends.length > 0) {
            select_chat(searched_friends[0][1], searched_friends[0][0])
        } else if (searched_chats.length > 0) {
            select_chat(searched_chats[0][0], undefined)
        }
    }

    function is_friend_typing(friend: User) {
        let dm = $chats.find(c => c.kind === ChatType.DirectMessage && c.users[0] === friend.key)
        return dm && dm.typing_indicator.has(friend.key)
    }

    function get_chat_name(chat: Chat): string {
        if (chat.name) return chat.name
        return chat.users
            .map(user => Store.getUser(user))
            .map(u => get(u).name)
            .join(", ")
    }

    async function select_chat(chat: Chat | undefined, user: User | undefined) {
        filter = ""
        filter_chat()
        if (chat !== undefined) {
            Store.setActiveChat(chat!)
        } else if (user !== undefined) {
            let chat = Store.getChatForUser(user.key)
            if (chat) {
                Store.setActiveChat(chat)
                goto(Route.Chat)
            } else {
                let result = await RaygunStoreInstance.createConversation(user)
                result.onSuccess(chat => {
                    Store.setActiveChat(chat)
                    goto(Route.Chat)
                })
            }
        }
    }
</script>

{#if searched_friends.length > 0 || searched_chats.length > 0}
    <div class="searchbar-dropdown">
        {#if searched_friends.length > 0}
            <div class="searchbar-entry-label">
                {$_("generic.users")}
            </div>
            {#each searched_friends as [friend, chat]}
                <div class="searchbar-entry" role="none" on:click={() => select_chat(chat, friend)}>
                    <div class="profile-picture-wrap">
                        <ProfilePicture id={friend.key} typing={is_friend_typing(friend)} image={friend.profile.photo.image} status={friend.profile.status} size={Size.Medium} loading={loading} frame={friend.profile.photo.frame} />
                    </div>
                    <span class="entry-title">
                        <span class="highlight-search-typed-chars">
                            {friend.name.substring(0, filter.length)}
                        </span>
                        <span class="remaining-match-searc">
                            {friend.name.substring(filter.length)}
                        </span>
                    </span>
                </div>
            {/each}
            {#if searched_chats.length > 0}
                <div class="border"></div>
            {/if}
        {/if}
        {#if searched_chats.length > 0}
            <div class="searchbar-entry-label">
                {$_("generic.groups")}
            </div>
            {#each searched_chats as [chat, name, users]}
                <div class="searchbar-entry searchbar-entry-group">
                    <div class="group" role="none" on:click={() => select_chat(chat, undefined)}>
                        <div class="profile-picture-wrap">
                            {#if chat.users.length === 2}
                                <ProfilePicture
                                    typing={chat.typing_indicator.size > 0}
                                    image={$userCache[chat.users[0]].profile.photo.image}
                                    status={$userCache[chat.users[0]].profile.status}
                                    size={Size.Medium}
                                    loading={loading}
                                    id={$userCache[chat.users[0]].key}
                                    frame={$userCache[chat.users[0]].profile.photo.frame} />
                            {:else}
                                <ProfilePictureMany users={chat.users.map(u => $userCache[u])} />
                            {/if}
                        </div>
                        {#if name.startsWith(filter.toLocaleLowerCase())}
                            <span class="entry-title">
                                <span class="highlight-search-typed-chars">
                                    {name.substring(0, filter.length)}
                                </span>
                                <span class="remaining-match-search">
                                    {name.substring(filter.length)}
                                </span>
                            </span>
                        {:else}
                            <span class="entry-title">
                                {name}
                            </span>
                        {/if}
                    </div>
                    <div class="group-users">
                        {#each users as user}
                            <div class="searchbar-entry-group-user">
                                <div class="profile-picture-wrap">
                                    <ProfilePicture id={user.key} typing={is_friend_typing(user)} image={user.profile.photo.image} status={user.profile.status} size={Size.Medium} loading={loading} frame={user.profile.photo.frame} />
                                </div>
                                <span class="entry-title">
                                    <span class="highlight-search-typed-chars">
                                        {user.name.substring(0, filter.length)}
                                    </span>
                                    <span class="remaining-match-searc">
                                        {user.name.substring(filter.length)}
                                    </span>
                                </span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
{/if}

<style lang="scss">
    .searchbar-dropdown {
        position: absolute;
        display: inline-flex;
        flex-direction: column;
        border-radius: var(--border-radius);
        background: var(--alt-color);
        max-width: 40%;
        overflow: hidden;
        z-index: 100;
        .border {
            width: 95%;
            height: 1px;
            background: var(--color-muted);
            margin: 0 auto;
            margin-top: 8px;
        }
        .searchbar-entry-label {
            padding: var(--padding-minimal);
            font-weight: bold;
        }
        .searchbar-entry {
            display: flex;
            padding: var(--padding-less);
            cursor: pointer;
            &:hover {
                background: var(--alt-color-alt);
            }

            .profile-picture-wrap {
                scale: 0.8;
            }

            .entry-title {
                display: flex;
                height: fit-content;
                align-self: center;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                padding-left: var(--padding);
            }
            .highlight-search-typed-chars {
                font-weight: bold;
                color: var(--highlight-color);
                background: var(--color);
            }
        }
        .searchbar-entry-group {
            flex-direction: column;
            .searchbar-entry-group-user {
                display: flex;
            }
            .group {
                display: flex;
            }
            .group-users {
                margin-left: 40px;
                display: flex;
            }
        }
    }
</style>
