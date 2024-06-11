<script lang="ts">
    import { Button, Icon, Label, Text, Input } from "$lib/elements"
    import { ChatPreview, ContextMenu, Modal } from "$lib/components"
    import { Sidebar, Slimbar, Topbar } from "$lib/layouts"
    import { Appearance, MessageDirection, Route, Shape, Size, TooltipPosition } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import type { Chat, User } from "$lib/types"
    import Fuse from "fuse.js"
    import Friend from "$lib/components/friends/Friend.svelte"
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { UIStore } from "$lib/state/ui"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { defaultUser, defaultChat, type FriendRequest, hashChat, type Message, type MessageGroup, type FileInfo, type Frame } from "$lib/types"
    import { onMount } from "svelte"
    import type { WarpError } from "$lib/wasm/HandleWarpErrors"
    import Key from "$lib/components/settings/Key.svelte"
    import Toast from "$lib/elements/Toast.svelte"

    // Initialize locale
    initLocale()

    let loading: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let friends: User[] = get(Store.state.friends)
    let blocked: User[] = get(Store.state.blocked)
    let incomingRequests: FriendRequest[] = Store.inboundRequests
    let outgoingRequests: FriendRequest[] = Store.outboundRequests

    let tab: string = "all"

    function toggleSidebar(): void {
        UIStore.toggleSidebar()
    }

    // Function to group users alphabetically by the first character of their usernames
    function groupUsersAlphabetically(users: User[]): { [letter: string]: User[] } {
        const groupedUsers: { [letter: string]: User[] } = {}
        users.forEach(user => {
            const firstChar: string = user.name.charAt(0).toUpperCase()
            if (!groupedUsers[firstChar]) {
                groupedUsers[firstChar] = []
            }
            groupedUsers[firstChar].push(user)
        })
        return groupedUsers
    }

    let sentRequest: boolean
    let sentRequestError: WarpError | undefined
    let requestString: string
    let submitRequest = async function () {
        get(Store.state.logger).info("Sending friend request to " + requestString)
        let requestSent = await MultipassStoreInstance.sendFriendRequest(requestString)
        requestSent.fold(
            (e: WarpError) => {
                sentRequestError = e
                sentRequest = true
            },
            () => {
                sentRequest = true
                sentRequestError = undefined
            }
        )
    }

   let acceptRequest = async function (friendUser: User) {
        let friendRequestAccepted = await MultipassStoreInstance.acceptFriendRequest(friendUser.key)
        friendRequestAccepted.onSuccess(() => {
            Store.acceptRequest(friendUser)
        })
    }

    let denyRequest = async function (friendUser: User) {
        let friendRequestDenied = await MultipassStoreInstance.denyFriendRequest(friendUser.key)
        friendRequestDenied.onSuccess(() => {
            Store.denyRequest(friendUser)
        })
    }

    let cancelRequest = async function (friendUser: User) {
        let friendRequestCancelled = await MultipassStoreInstance.cancelFriendRequest(friendUser.key)
        friendRequestCancelled.onSuccess(() => {
            Store.cancelRequest(friendUser)
        })
    }

    let removeFriend = async function (friendUser: User) {
        let friendRemoved = await MultipassStoreInstance.removeFriend(friendUser.key)
        friendRemoved.onSuccess(() => {
            Store.removeFriend(friendUser)
        })
    }

    let blockUser = async function (friendUser: User) {
        let userBlocked = await MultipassStoreInstance.blockUser(friendUser.key)
        userBlocked.onSuccess(() => {
            Store.blockUser(friendUser)
        })
    }

    let unblockUser = async function (friendUser: User) {
        let userUnblocked = await MultipassStoreInstance.unblockUser(friendUser.key)
        userUnblocked.onSuccess(() => {
            Store.unblockUser(friendUser)
        })
    }

    async function fetchFriendsAndRequests() {
        let incomingFriendRequests: Array<any> = await MultipassStoreInstance.listIncomingFriendRequests()
        let outgoingFriendRequests: Array<any> = await MultipassStoreInstance.listOutgoingFriendRequests()
        let blockedUsers: Array<any> = await MultipassStoreInstance.listBlockedFriends()
        let friends = await MultipassStoreInstance.listFriends()
        Store.setFriendRequests(incomingFriendRequests, outgoingFriendRequests)
        Store.setFriends(friends)
        Store.setBlockedUsers(blockedUsers)
    }


    onMount(() => {
        let intervalId = setInterval(() => {
            fetchFriendsAndRequests();
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
    });

    let searchString: string = ""

    const fuseOptions = {
        includeMatches: true,
        // isCaseSensitive: false,
        // includeScore: false,
        shouldSort: true,
        threshold: 0.35,
        // findAllMatches: false,
        minMatchCharLength: 1,
        keys: ["name"],
    }

    const fuse = new Fuse(friends, fuseOptions)
    let searchResult = fuse.search("")

    $: if (searchString !== undefined) {
        searchResult = fuse.search(searchString)
    }

    Store.state.activeRequests.subscribe(r => {
        incomingRequests = r.filter(r => r.direction === MessageDirection.Inbound)
        outgoingRequests = r.filter(r => r.direction === MessageDirection.Outbound)
    })
    Store.state.friends.subscribe(f => (friends = f))
    Store.state.blocked.subscribe(u => (blocked = u))
    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))
    let chats: Chat[] = get(UIStore.state.chats)
    UIStore.state.chats.subscribe(sc => (chats = sc))
    let activeChat: Chat = get(Store.state.activeChat)
    Store.state.activeChat.subscribe(c => (activeChat = c))

    async function copy_did(short: boolean) {
        let user = get(Store.state.user)
        if (short) {
            await navigator.clipboard.writeText(`${user.name}#${user.id.short}`)
        } else {
            await navigator.clipboard.writeText(`${user.key}`)
        }
    }
</script>

<div id="page">
    <!-- Modals -->
    {#if sentRequest}
        <Modal
            padded
            on:close={_ => {
                sentRequest = false
            }}>
            <svelte:fragment slot="controls">
                <Button
                    icon
                    small
                    appearance={Appearance.Alt}
                    on:click={_ => {
                        sentRequest = false
                    }}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
            <div class="request-sent">
                {#if sentRequestError != undefined}
                    <Icon size={Size.Largest} icon={Shape.XMark} highlight={Appearance.Error} />
                    <Text size={Size.Large}>Error!</Text>
                    <Text muted>{sentRequestError}</Text>
                {:else}
                    <Icon size={Size.Largest} icon={Shape.CheckMark} highlight={Appearance.Success} />
                    <Text size={Size.Large}>Request Dispatched!</Text>
                    <Text muted>Your request is making it's way to {requestString}.</Text>
                {/if}
            </div>
        </Modal>
    {/if}
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Friends} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Friends}>
        <Button hook="button-marketplace" outline appearance={Appearance.Alt} text={$_("market.market")}>
            <Icon icon={Shape.Shop} />
        </Button>

        <div class="content-header">
            <Label text={$_("chat.chat_plural")} />
            <Button hook="button-create-group-chat" icon small tooltip={$_("chat.create")} tooltipPosition={TooltipPosition.LEFT}>
                <Icon icon={Shape.ChatPlus} />
            </Button>
        </div>

        {#each chats as chat}
            <ContextMenu
                items={[
                    {
                        id: "hide",
                        icon: Shape.EyeSlash,
                        text: "Hide",
                        appearance: Appearance.Default,
                        onClick: () => UIStore.removeSidebarChat(chat),
                    },
                    {
                        id: "mark_read",
                        icon: Shape.CheckMark,
                        text: "Mark Read",
                        appearance: Appearance.Default,
                        onClick: () => {},
                    },
                ]}>
                <ChatPreview slot="content" let:open on:contextmenu={open} chat={chat} loading={loading} simpleUnreads cta={activeChat === chat} />
            </ContextMenu>
        {/each}
    </Sidebar>
    <div class="content">
        <Topbar>
            <svelte:fragment slot="controls">
                <Button appearance={tab === "all" ? Appearance.Primary : Appearance.Alt} text={$_("friends.all")} on:click={_ => (tab = "all")}>
                    <Icon icon={Shape.Users} />
                </Button>
                <Button appearance={tab === "active" ? Appearance.Primary : Appearance.Alt} text={$_("friends.active")} on:click={_ => (tab = "active")}>
                    <Icon icon={Shape.ArrowsLeftRight} />
                </Button>
                <Button appearance={tab === "blocked" ? Appearance.Primary : Appearance.Alt} text={$_("friends.blocked")} on:click={_ => (tab = "blocked")}>
                    <Icon icon={Shape.NoSymbol} />
                </Button>
            </svelte:fragment>
        </Topbar>

        <div class="body">
            {#if tab === "all"}
                <Label text={$_("friends.add_someone")} />
                <div class="section">
                    <Input alt placeholder={$_("friends.find_placeholder")} on:enter={submitRequest} bind:value={requestString}>
                        <Icon icon={Shape.Search} />
                    </Input>
                    <Button hook="button-add-friend" appearance={Appearance.Alt} text={$_("friends.add")} on:click={submitRequest}>
                        <Icon icon={Shape.Plus} />
                    </Button>
                    <ContextMenu
                        hook="context-menu-copy-id"
                        items={[
                            {
                                id: "copy-id",
                                icon: Shape.Users,
                                text: $_("settings.profile.copy_id"),
                                appearance: Appearance.Default,
                                onClick: async () => await copy_did(true),
                            },
                            {
                                id: "copy-did",
                                icon: Shape.Clipboard,
                                text: $_("settings.profile.copy_did"),
                                appearance: Appearance.Default,
                                onClick: async () => await copy_did(false),
                            },
                        ]}>
                        <Button hook="button-copy-id" slot="content" appearance={Appearance.Alt} icon tooltip={$_("friends.copy_did")} let:open on:contextmenu={open} on:click={async _ => await copy_did(true)}>
                            <Icon icon={Shape.Clipboard} />
                        </Button>
                    </ContextMenu>
                </div>

                <Label text={$_("friends.search_friends_placeholder")} />
                <div class="section">
                    <Input alt placeholder={$_("friends.search_friends_placeholder")} bind:value={searchString}>
                        <Icon icon={Shape.Search} />
                    </Input>
                </div>

                {#if searchResult.length || searchString.length}
                    <div class="section column search-results">
                        <Label text={$_("generic.search_results")} />
                        {#if searchResult.length}
                            {#each searchResult as result}
                                <Friend friend={result.item}>
                                    <svelte:fragment slot="controls">
                                        <Button
                                            text={$_("chat.chat")}
                                            on:click={_ => {
                                                Store.setActiveDM(result.item)
                                                goto(Route.Chat)
                                            }}>
                                            <Icon icon={Shape.ChatBubble} />
                                        </Button>
                                        <Button
                                            icon
                                            appearance={Appearance.Alt}
                                            tooltip={$_("generic.remove")}
                                            on:click={_ => {
                                                removeFriend(result.item)
                                            }}>
                                            <Icon icon={Shape.UserMinus} />
                                        </Button>
                                        <Button
                                            icon
                                            appearance={Appearance.Alt}
                                            tooltip={$_("friends.block")}
                                            on:click={_ => {
                                                blockUser(result.item)
                                            }}>
                                            <Icon icon={Shape.NoSymbol} />
                                        </Button>
                                    </svelte:fragment>
                                </Friend>
                            {/each}
                        {:else}
                            <Text>{$_("generic.no_results")}</Text>
                        {/if}
                    </div>
                {/if}
                <div class="section column">
                    {#each Object.keys(groupUsersAlphabetically(friends)).sort() as letter}
                        {#if groupUsersAlphabetically(friends)[letter].length > 0}
                            <Label text={letter} />
                            {#each groupUsersAlphabetically(friends)[letter] as friend}
                                <Friend friend={friend}>
                                    <svelte:fragment slot="controls">
                                        <Button
                                            text={$_("chat.chat")}
                                            on:click={_ => {
                                                Store.setActiveDM(friend)
                                                goto(Route.Chat)
                                            }}>
                                            <Icon icon={Shape.ChatBubble} />
                                        </Button>
                                        <Button icon appearance={Appearance.Alt} tooltip={$_("generic.remove")} on:click={_ => removeFriend(friend)}>
                                            <Icon icon={Shape.UserMinus} />
                                        </Button>
                                        <Button icon appearance={Appearance.Alt} tooltip={$_("friends.block")} on:click={_ => blockUser(friend)}>
                                            <Icon icon={Shape.NoSymbol} />
                                        </Button>
                                    </svelte:fragment>
                                </Friend>
                            {/each}
                        {/if}
                    {/each}
                </div>
            {:else if tab === "active"}
                <div class="section column">
                    <Label text={$_("friends.outgoing_requests")} />
                    {#each outgoingRequests as request}
                        <Friend friend={request.to}>
                            <svelte:fragment slot="controls">
                                <Button appearance={Appearance.Alt} text={$_("generic.cancel")} on:click={_ => cancelRequest(request.to)}>
                                    <Icon icon={Shape.NoSymbol} />
                                </Button>
                            </svelte:fragment>
                        </Friend>
                    {/each}
                    {#if outgoingRequests.length === 0}
                        <Text>No outbound requests.</Text>
                    {/if}
                    <Label text={$_("friends.incoming_requests")} />
                    {#each incomingRequests as request}
                        <Friend friend={request.from}>
                            <svelte:fragment slot="controls">
                                <Button appearance={Appearance.Success} text={$_("generic.accept")} on:click={_ => acceptRequest(request.from)}>
                                    <Icon icon={Shape.CheckMark} />
                                </Button>
                                <Button appearance={Appearance.Alt} text={$_("generic.deny")} on:click={_ => denyRequest(request.from)}>
                                    <Icon icon={Shape.XMark} />
                                </Button>
                            </svelte:fragment>
                        </Friend>
                    {/each}
                    {#if incomingRequests.length === 0}
                        <Text>No inbound requests.</Text>
                    {/if}
                </div>
            {:else if tab === "blocked"}
                <div class="section column">
                    <Label text={$_("friends.blocked_users")} />
                    {#each blocked as user}
                        <Friend friend={user}>
                            <svelte:fragment slot="controls">
                                <Button appearance={Appearance.Alt} text={$_("friends.unblock")} on:click={_ => unblockUser(user)}>
                                    <Icon icon={Shape.NoSymbol} />
                                </Button>
                            </svelte:fragment>
                        </Friend>
                    {/each}
                    {#if blocked.length === 0}
                        <Text>No users blocked.</Text>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;

        .request-sent {
            display: inline-flex;
            justify-content: center;
            flex-direction: column;
            gap: var(--gap);
            align-items: center;
        }

        .content-header {
            display: inline-flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
        }

        .content {
            display: flex;
            min-height: 0;
            display: flex;
            flex-direction: column;
            flex: 1;

            .body {
                width: 100%;
                display: inline-flex;
                flex-direction: column;
                padding: var(--padding);
                gap: var(--gap-less);

                .search-results {
                    border: var(--border-width) solid var(--border-color);
                    padding: var(--padding);
                    border-radius: var(--border-radius);
                }
                .section {
                    display: inline-flex;
                    gap: var(--gap);
                    padding-bottom: var(--gap);

                    &.column {
                        flex-direction: column;
                        min-height: var(--min-scroll-height);
                        overflow-y: scroll;
                        overflow-x: hidden;
                        padding-right: var(--padding);
                    }
                }
            }
        }
    }
</style>
