<script lang="ts">
    import { Button, Icon, Label, Text, Input } from "$lib/elements"
    import { ChatPreview, ContextMenu, Modal } from "$lib/components"
    import { Sidebar, Topbar } from "$lib/layouts"
    import { Appearance, Route, Shape, TooltipPosition } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import type { Chat, User } from "$lib/types"
    import Fuse from "fuse.js"
    import Friend from "$lib/components/friends/Friend.svelte"
    import { Store } from "$lib/state/Store"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { UIStore } from "$lib/state/ui"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { log } from "$lib/utils/Logger"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { CommonInputRules } from "$lib/utils/CommonInputRules"
    import CreateGroup from "$lib/components/group/CreateGroup.svelte"
    import { onDestroy } from "svelte"

    let loading: boolean = false
    $: sidebarOpen = UIStore.state.sidebarOpen
    $: friends = Store.getUsers(Store.state.friends)
    $: blocked = Store.getUsers(Store.state.blocked)
    $: activeRequests = Store.state.activeRequests
    $: incomingRequests = Store.inboundRequests($activeRequests)
    $: outgoingRequests = Store.outboundRequests($activeRequests)
    let isValidFriendDid: boolean = false
    let newGroup: boolean = false

    let tab: "all" | "active" | "blocked" = "all"

    let unsub = Store.state.pageState.subscribe(s => {
        function isTab(value: string): value is "all" | "active" | "blocked" {
            return value === "all" || value === "active" || value === "blocked"
        }
        if (isTab(s)) {
            tab = s
        }
    })

    onDestroy(() => {
        unsub()
    })

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

    let requestString: string
    let submitRequest = async function () {
        log.info("Sending friend request to " + requestString)
        if (!isValidFriendDid) {
            return
        }
        let requestSent = await MultipassStoreInstance.sendFriendRequest(requestString)
        requestSent.fold(
            (e: WarpError) => {
                requestString = ""
                Store.addToastNotification(new ToastMessage("", e, 3, Shape.XMark, Appearance.Error))
            },
            () => {
                requestString = ""
                Store.addToastNotification(new ToastMessage("", `Your request is making it's way!`, 3, Shape.CheckMark, Appearance.Success))
            }
        )
        isValidFriendDid = false
    }

    let acceptRequest = async function (friendUser: string) {
        let friendRequestAccepted = await MultipassStoreInstance.acceptFriendRequest(friendUser)
        friendRequestAccepted.onSuccess(() => {
            Store.acceptRequest(friendUser)
        })
    }

    let denyRequest = async function (friendUser: string) {
        let friendRequestDenied = await MultipassStoreInstance.denyFriendRequest(friendUser)
        friendRequestDenied.onSuccess(() => {
            Store.denyRequest(friendUser)
        })
    }

    let cancelRequest = async function (friendUser: string) {
        let friendRequestCancelled = await MultipassStoreInstance.cancelFriendRequest(friendUser)
        friendRequestCancelled.onSuccess(() => {
            Store.cancelRequest(friendUser)
        })
    }

    let removeFriend = async function (friendUser: string) {
        let friendRemoved = await MultipassStoreInstance.removeFriend(friendUser)
        friendRemoved.onSuccess(() => {
            Store.removeFriend(friendUser)
        })
    }

    let blockUser = async function (friendUser: string) {
        let userBlocked = await MultipassStoreInstance.blockUser(friendUser)
        userBlocked.onSuccess(() => {
            Store.blockUser(friendUser)
        })
    }

    let unblockUser = async function (friendUser: string) {
        let userUnblocked = await MultipassStoreInstance.unblockUser(friendUser)
        userUnblocked.onSuccess(() => {
            Store.unblockUser(friendUser)
        })
    }

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

    $: fuse = new Fuse($friends, fuseOptions)
    $: searchResult = fuse.search("")
    $: if (searchString !== undefined) {
        searchResult = fuse.search(searchString)
    }

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
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={$sidebarOpen} activeRoute={Route.Friends}>
        <!--
            <Button hook="button-marketplace" outline appearance={Appearance.Alt} text={$_("market.market")}>
                <Icon icon={Shape.Shop} />
            </Button>
        -->
        <div class="content-header">
            <Label hook="label-chats" text={$_("chat.chat_plural")} />
            <Button hook="button-create-group-chat" icon small tooltipPosition={TooltipPosition.LEFT} appearance={Appearance.Primary} tooltip={$_("chat.create")} on:click={_ => (newGroup = true)}>
                <Icon icon={Shape.ChatPlus} alt />
            </Button>
        </div>

        {#each chats.slice().sort((a, b) => {
            const dateA = new Date(a.last_message_at || 0)
            const dateB = new Date(b.last_message_at || 0)
            return dateB.getTime() - dateA.getTime()
        }) as chat}
            <ContextMenu
                hook="context-menu-sidebar-chat"
                items={[
                    {
                        id: "hide",
                        icon: Shape.EyeSlash,
                        text: $_("chat.hide"),
                        appearance: Appearance.Default,
                        onClick: () => UIStore.removeSidebarChat(chat),
                    },
                    {
                        id: "mark_read",
                        icon: Shape.CheckMark,
                        text: $_("chat.markRead"),
                        appearance: Appearance.Default,
                        onClick: () => {},
                    },
                ]}>
                <ChatPreview slot="content" let:open on:contextmenu={open} chat={chat} loading={loading} cta={activeChat === chat} />
            </ContextMenu>
        {/each}
    </Sidebar>
    <div class="content">
        <Topbar>
            <svelte:fragment slot="controls">
                {#if tab === "all"}
                    <Button hook="button-friends-all" appearance={Appearance.Alt} text={$_("friends.all")} on:click={_ => (tab = "all")}>
                        <Icon icon={Shape.Users} alt />
                    </Button>
                {:else}
                    <Button hook="button-friends-all" appearance={Appearance.Alt} text={$_("friends.all")} on:click={_ => (tab = "all")}>
                        <Icon icon={Shape.Users} />
                    </Button>
                {/if}
                {#if tab === "active"}
                    <Button badge={incomingRequests.length} hook="button-friends-active" appearance={Appearance.Primary} text={$_("friends.active")} on:click={_ => (tab = "active")} hideTextOnMobile>
                        <Icon icon={Shape.ArrowsLeftRight} alt />
                    </Button>
                {:else}
                    <Button badge={incomingRequests.length} hook="button-friends-active" appearance={Appearance.Alt} text={$_("friends.active")} on:click={_ => (tab = "active")} hideTextOnMobile>
                        <Icon icon={Shape.ArrowsLeftRight} />
                    </Button>
                {/if}
                {#if tab === "blocked"}
                    <Button hook="button-friends-blocked" appearance={Appearance.Primary} text={$_("friends.blocked")} on:click={_ => (tab = "blocked")} hideTextOnMobile>
                        <Icon icon={Shape.NoSymbol} alt />
                    </Button>
                {:else}
                    <Button hook="button-friends-blocked" appearance={Appearance.Alt} text={$_("friends.blocked")} on:click={_ => (tab = "blocked")} hideTextOnMobile>
                        <Icon icon={Shape.NoSymbol} />
                    </Button>
                {/if}
            </svelte:fragment>
        </Topbar>

        <div class="body">
            {#if tab === "all"}
                <Label hook="label-add-someone" text={$_("friends.add_someone")} />
                <div class="section" data-cy="friends-section-all">
                    <Input
                        hook="input-add-friend"
                        alt
                        placeholder={$_("friends.find_placeholder")}
                        on:isValid={e => {
                            isValidFriendDid = e.detail
                        }}
                        rules={CommonInputRules.friendRequestDid}
                        on:enter={submitRequest}
                        bind:value={requestString}>
                        <Icon icon={Shape.Search} />
                    </Input>
                    <Button hook="button-add-friend" disabled={!isValidFriendDid} appearance={Appearance.Alt} text={$_("friends.add")} on:click={submitRequest}>
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
                        <Button hook="button-copy-id" slot="content" appearance={Appearance.Alt} icon tooltip={$_("friends.copy_did")} let:open on:contextmenu={open} on:click={async _ => await copy_did(false)}>
                            <Icon icon={Shape.Clipboard} />
                        </Button>
                    </ContextMenu>
                </div>

                <Label hook="label-search-friends" text={$_("friends.search_friends_placeholder")} />
                <div class="section">
                    <Input hook="input-search-friends" alt placeholder={$_("friends.search_friends_placeholder")} bind:value={searchString}>
                        <Icon icon={Shape.Search} />
                    </Input>
                </div>

                {#if searchResult.length || searchString.length}
                    <div class="section column search-results">
                        <Label hook="label-search-results" text={$_("generic.search_results")} />
                        {#if searchResult.length}
                            {#each searchResult as result}
                                <Friend friend={result.item}>
                                    <svelte:fragment slot="controls">
                                        <Button
                                            hook="button-search-friend-chat"
                                            text={$_("chat.chat")}
                                            on:click={async _ => {
                                                let chat = Store.getChatForUser(result.item.key)
                                                if (chat) {
                                                    Store.setActiveChat(chat)
                                                } else {
                                                    let conversation = await RaygunStoreInstance.createConversation(result.item)
                                                    conversation.onSuccess(chat => {
                                                        Store.setActiveChat(chat)
                                                    })
                                                    conversation.onFailure(async e => {
                                                        let conversations = await RaygunStoreInstance.listConversations()
                                                        conversations.onSuccess(conversations => {
                                                            let chat = conversations.find(c => c.users.includes(result.item.key))
                                                            if (chat) {
                                                                Store.setActiveChat(chat)
                                                            }
                                                        })
                                                    })
                                                }
                                                goto(Route.Chat)
                                            }}>
                                            <Icon icon={Shape.ChatBubble} />
                                        </Button>
                                        <Button
                                            icon
                                            hook="button-search-friend-remove"
                                            appearance={Appearance.Alt}
                                            tooltip={$_("generic.remove")}
                                            on:click={_ => {
                                                removeFriend(result.item.key)
                                            }}>
                                            <Icon icon={Shape.UserMinus} />
                                        </Button>
                                        <Button
                                            icon
                                            hook="button-search-friend-block"
                                            appearance={Appearance.Alt}
                                            tooltip={$_("friends.block")}
                                            on:click={_ => {
                                                blockUser(result.item.key)
                                            }}>
                                            <Icon icon={Shape.NoSymbol} />
                                        </Button>
                                    </svelte:fragment>
                                </Friend>
                            {/each}
                        {:else}
                            <Text hook="text-search-friend-no-results">{$_("generic.no_results")}</Text>
                        {/if}
                    </div>
                {/if}
                <div class="test">
                    <div class="friends-section section column">
                        {#each Object.keys(groupUsersAlphabetically($friends)).sort() as letter}
                            {#if groupUsersAlphabetically($friends)[letter].length > 0}
                                <Label hook="label-friend-list-{letter}" text={letter} />
                                {#each groupUsersAlphabetically($friends)[letter] as friend}
                                    <Friend friend={friend}>
                                        <svelte:fragment slot="controls">
                                            <Button
                                                hook="button-friend-chat"
                                                appearance={Appearance.Primary}
                                                text={$_("chat.chat")}
                                                on:click={async _ => {
                                                    let chat = Store.getChatForUser(friend.key)
                                                    if (chat) {
                                                        Store.setActiveChat(chat)
                                                        goto(Route.Chat)
                                                    } else {
                                                        let conversation = await RaygunStoreInstance.createConversation(friend)
                                                        conversation.onSuccess(chat => {
                                                            Store.setActiveChat(chat)
                                                            goto(Route.Chat)
                                                        })
                                                        conversation.onFailure(async e => {
                                                            let conversations = await RaygunStoreInstance.listConversations()
                                                            conversations.onSuccess(conversations => {
                                                                let chat = conversations.find(c => c.users.includes(friend.key))
                                                                if (chat) {
                                                                    Store.setActiveChat(chat)
                                                                    goto(Route.Chat)
                                                                }
                                                            })
                                                        })
                                                    }
                                                }}>
                                                <Icon icon={Shape.ChatBubble} alt />
                                            </Button>
                                            <Button hook="button-friend-remove" icon appearance={Appearance.Alt} tooltip={$_("generic.remove")} on:click={_ => removeFriend(friend.key)}>
                                                <Icon icon={Shape.UserMinus} />
                                            </Button>
                                            <Button hook="button-friend-block" icon appearance={Appearance.Alt} tooltip={$_("friends.block")} on:click={_ => blockUser(friend.key)}>
                                                <Icon icon={Shape.NoSymbol} />
                                            </Button>
                                        </svelte:fragment>
                                    </Friend>
                                {/each}
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else if tab === "active"}
                <div class="section column" data-cy="friends-section-requests">
                    <Label hook="label-outgoing-requests" text={$_("friends.outgoing_requests")} />
                    {#each outgoingRequests as request}
                        <Friend friend={get(Store.getUser(request.to))}>
                            <svelte:fragment slot="controls">
                                <Button hook="button-friend-cancel" appearance={Appearance.Alt} text={$_("generic.cancel")} on:click={_ => cancelRequest(request.to)}>
                                    <Icon icon={Shape.NoSymbol} />
                                </Button>
                            </svelte:fragment>
                        </Friend>
                    {/each}
                    {#if outgoingRequests.length === 0}
                        <Text hook="text-no-outbound-requests">{$_("friends.noOutgoing")}</Text>
                    {/if}
                    <Label hook="label-incoming-requests" text={$_("friends.incoming_requests")} />
                    {#each incomingRequests as request}
                        <Friend friend={get(Store.getUser(request.from))}>
                            <svelte:fragment slot="controls">
                                <Button hook="button-friend-accept" appearance={Appearance.Success} text={$_("generic.accept")} on:click={_ => acceptRequest(request.from)}>
                                    <Icon icon={Shape.CheckMark} />
                                </Button>
                                <Button hook="button-friend-deny" appearance={Appearance.Alt} text={$_("generic.deny")} on:click={_ => denyRequest(request.from)}>
                                    <Icon icon={Shape.XMark} />
                                </Button>
                            </svelte:fragment>
                        </Friend>
                    {/each}
                    {#if incomingRequests.length === 0}
                        <Text hook="text-no-incoming-requests">{$_("friends.noIncoming")}</Text>
                    {/if}
                </div>
            {:else if tab === "blocked"}
                <div class="section column" data-cy="friends-section-blocked">
                    <Label hook="label-blocked-users" text={$_("friends.blocked_users")} />
                    {#each $blocked as user}
                        <Friend friend={user}>
                            <svelte:fragment slot="controls">
                                <Button hook="button-friend-unblock" appearance={Appearance.Alt} text={$_("friends.unblock")} on:click={_ => unblockUser(user.key)}>
                                    <Icon icon={Shape.NoSymbol} />
                                </Button>
                            </svelte:fragment>
                        </Friend>
                    {/each}
                    {#if $blocked.length === 0}
                        <Text hook="text-no-blocked-users">{$_("friends.noBlocked")}</Text>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    {#if newGroup}
        <Modal on:close={() => (newGroup = false)}>
            <CreateGroup on:create={() => (newGroup = false)} />
        </Modal>
    {/if}
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;

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
            min-width: 0;

            .body {
                width: 100%;
                display: inline-flex;
                flex-direction: column;
                padding: var(--padding);
                gap: var(--gap-less);
                height: 100%;

                .search-results {
                    border: var(--border-width) solid var(--border-color);
                    padding: var(--padding);
                    border-radius: var(--border-radius);
                }

                .test {
                    min-height: 0;
                    width: 100%;
                    height: 35px;
                    display: flex;
                    flex-direction: column;
                    padding-right: var(--gap);
                    flex-grow: 1;
                    overflow: hidden;
                }

                .friends-section {
                    padding-top: 15px;
                    min-height: 0;
                    width: 100%;
                    overflow-y: scroll;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    padding-right: var(--gap);
                }

                .section {
                    display: inline-flex;
                    gap: var(--gap);
                    padding-bottom: var(--gap);

                    &.column {
                        flex-direction: column;
                        min-height: var(--min-scroll-height) + var(--gap);
                        padding-right: var(--padding);
                    }
                }
            }
        }
    }
</style>
