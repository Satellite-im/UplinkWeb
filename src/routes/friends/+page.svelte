<script lang="ts">  
    import { Button, Icon, Label, Text, Input } from "$lib/elements"
    import { ChatPreview, ContextMenu, Modal, ProfilePicture } from "$lib/components"
    import { Sidebar, Slimbar, Topbar } from "$lib/layouts"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { blocked_users, chats, fake_user_array, mock_users } from "$lib/mock/users"
    import type { ContextItem, User } from "$lib/types"
    import Controls from "$lib/layouts/Controls.svelte"
    import Fuzzy from "svelte-fuzzy"

    // Initialize locale
    initLocale()

    let loading: boolean = false
    let sidebarOpen: boolean = true

    let tab: string = "all";

    function toggleSidebar(): void {
        sidebarOpen = !sidebarOpen
    }

    // Function to group users alphabetically by the first character of their usernames
    function groupUsersAlphabetically(users: User[]): { [letter: string]: User[] } {
        const groupedUsers: { [letter: string]: User[] } = {};
        users.forEach(user => {
            const firstChar: string = user.name.charAt(0).toUpperCase();
            if (!groupedUsers[firstChar]) {
                groupedUsers[firstChar] = [];
            }
            groupedUsers[firstChar].push(user);
        });
        return groupedUsers;
    }

    // TODO: Move this into a global state
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []

    let sentRequest: boolean
    let requestString: string
    let submitRequest = function () {
        sentRequest = true
    }

    // Fuse.js options
    let options = { keys: ["name"] }
    let formatted: any[] = []
    let searchString: string

    function findFirstUserByName(line: any) {
        console.log('line', line)
        let name: string
        line.forEach((item: { text: string }) => name += item.text)
        return mock_users.filter(u => u.name = name)[0]
    }
</script>

<div id="page">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <!-- Modals -->
    {#if sentRequest}
        <Modal on:close={(_) => {sentRequest = false}}>
            <svelte:fragment slot="controls">
                <Button
                    icon 
                    small 
                    appearance={Appearance.Alt}
                    on:click={(_) => {sentRequest = false}}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
            <div class="request-sent">
                <Icon size={Size.Largest} icon={Shape.CheckMark} highlight={Appearance.Success}/>
                <Text size={Size.Large}>Request Dispatched!</Text>
                <Text muted>Your request is making it's way to {requestString}.</Text>
            </div>
        </Modal>
    {/if}
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Friends} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Friends} >
        <Button outline appearance={Appearance.Alt} text={$_("market.market")}>
            <Icon icon={Shape.Shop} />
        </Button>
        

        <div class="content-header">
            <Label text={$_("chat.chat_plural")} />
            <Button icon small tooltip={$_("chat.create")}>
                <Icon icon={Shape.ChatPlus} />
            </Button>
        </div>

        {#each chats as chat}
            <ChatPreview
                loading={loading}
                users={chat.users}
                typing={chat.activity}
                simpleUnreads
                notifications={chat.notifications}
                timestamp={chat.last_message_at}
                message={chat.last_message_preview}
                on:context={(evt) => {
                    contextPosition = evt.detail
                    contextData = [
                        {
                            id: "hide",
                            icon: Shape.EyeSlash,
                            text: "Hide",
                            appearance: Appearance.Default
                        },
                        {
                            id: "mark_read",
                            icon: Shape.CheckMark,
                            text: "Mark Read",
                            appearance: Appearance.Default
                        },
                    ]
                }} />
        {/each}
    </Sidebar>
    <div class="content">
        <Topbar>
            <Controls>
                <Button 
                    appearance={tab === "all" ? Appearance.Primary : Appearance.Alt} 
                    text={$_("friends.all")}
                    on:click={(_) => tab = "all"}>
                    <Icon icon={Shape.Users} />
                </Button>
                <Button 
                    appearance={tab === "active" ? Appearance.Primary : Appearance.Alt} 
                    text={$_("friends.active")}
                    on:click={(_) => tab = "active"}>
                    <Icon icon={Shape.ArrowsLeftRight} />
                </Button>
                <Button 
                    appearance={tab === "blocked" ? Appearance.Primary : Appearance.Alt} 
                    text={$_("friends.blocked")}
                    on:click={(_) => tab = "blocked"}>
                    <Icon icon={Shape.NoSymbol} />
                </Button>
            </Controls>
        </Topbar>

        <div class="body">
            {#if tab === "all"}
                <Label text={$_("friends.add_someone")} />
                <div class="section">
                    <Input alt placeholder={$_("friends.find_placeholder")} on:enter={submitRequest} on:keypress={(v) => { requestString = v.detail }} >
                        <Icon icon={Shape.Search} />
                    </Input>
                    <Button 
                        appearance={Appearance.Alt} 
                        text={$_("friends.add")}
                        on:click={submitRequest}>
                        <Icon icon={Shape.Plus} />
                    </Button>
                    <Button appearance={Appearance.Alt} icon tooltip={$_("friends.copy_did")}>
                        <Icon icon={Shape.Clipboard} />
                    </Button>
                </div>

                <Label text={$_("friends.search_friends_placeholder")} />
                <div class="section">
                    <Input alt placeholder={$_("friends.search_friends_placeholder")}  on:keypress={(v) => { searchString = v.detail }}>
                        <Icon icon={Shape.Search} />
                    </Input>
                    <Fuzzy query={searchString} data={mock_users} {options} bind:formatted />
                </div>
                <div class="section column">
                    {#each formatted as item}
                        {#each item as line}
                            <div class="friend">
                                <ProfilePicture 
                                    size={Size.Small} 
                                    image={findFirstUserByName(line)?.profile.photo.image} 
                                    status={findFirstUserByName(line)?.profile.status} />
                                <Text class="username">
                                    {findFirstUserByName(line)?.name}
                                </Text>
                                <Controls>
                                    <Button 
                                        text={$_("chat.chat")}>
                                        <Icon icon={Shape.ChatBubble} />
                                    </Button>
                                    <Button 
                                        icon 
                                        appearance={Appearance.Alt} 
                                        tooltip={$_("generic.remove")}>
                                        <Icon icon={Shape.UserMinus} />
                                    </Button>
                                    <Button 
                                        icon 
                                        appearance={Appearance.Alt} 
                                        tooltip={$_("friends.block")}>
                                        <Icon icon={Shape.NoSymbol} />
                                    </Button>
                                </Controls>
                            </div>
                        {/each}
                    {/each}
                </div>
                <div class="section column">
                    {#each Object.keys(groupUsersAlphabetically(mock_users)).sort() as letter}
                        {#if groupUsersAlphabetically(mock_users)[letter].length > 0}
                            <Label text={letter} />
                            {#each groupUsersAlphabetically(mock_users)[letter] as friend}
                                <div class="friend">
                                    <ProfilePicture 
                                        size={Size.Small} 
                                        image={friend.profile.photo.image} 
                                        status={friend.profile.status} />
                                    <Text class="username">
                                        {friend.name}
                                    </Text>
                                    <Controls>
                                        <Button 
                                            text={$_("chat.chat")}>
                                            <Icon icon={Shape.ChatBubble} />
                                        </Button>
                                        <Button 
                                            icon 
                                            appearance={Appearance.Alt} 
                                            tooltip={$_("generic.remove")}>
                                            <Icon icon={Shape.UserMinus} />
                                        </Button>
                                        <Button 
                                            icon 
                                            appearance={Appearance.Alt} 
                                            tooltip={$_("friends.block")}>
                                            <Icon icon={Shape.NoSymbol} />
                                        </Button>
                                    </Controls>
                                </div>
                            {/each}
                        {/if}
                    {/each}
                </div>
            {/if}
            {#if tab === "active"}
                <div class="section column">
                    <Label text={$_("friends.outgoing_requests")} />
                    {#each fake_user_array as friend}
                        <div class="friend">
                            <ProfilePicture size={Size.Small} image={friend.profile.photo.image} status={friend.profile.status} />
                            <Text class="username">{friend.name}</Text>
                            <Controls>
                                <Button appearance={Appearance.Alt} text={$_("generic.cancel")}>
                                    <Icon icon={Shape.NoSymbol} />
                                </Button>
                            </Controls>
                        </div>
                    {/each}
                    <Label text={$_("friends.incoming_requests")} />
                    {#each fake_user_array as friend}
                        <div class="friend">
                            <ProfilePicture size={Size.Small} image={friend.profile.photo.image} status={friend.profile.status} />
                            <Text class="username">{friend.name}</Text>
                            <Controls>
                                <Button appearance={Appearance.Success} text={$_("generic.accept")} outline>
                                    <Icon icon={Shape.CheckMark} />
                                </Button>
                                <Button appearance={Appearance.Alt} text={$_("generic.deny")}>
                                    <Icon icon={Shape.XMark} />
                                </Button>
                            </Controls>
                        </div>
                    {/each}
                </div>
            {/if}
            {#if tab === "blocked"}
                <div class="section column">
                    <Label text={$_("friends.blocked_users")} />
                    {#each blocked_users as friend}
                        <div class="friend">
                            <ProfilePicture size={Size.Small} image={friend.profile.photo.image} status={friend.profile.status} />
                            <Text class="username">{friend.name}</Text>
                            <Controls>
                                <Button appearance={Appearance.Alt} text={$_("friends.unblock")}>
                                    <Icon icon={Shape.NoSymbol} />
                                </Button>
                            </Controls>
                        </div>
                    {/each}
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

                
                .section {
                    display: inline-flex;
                    gap: var(--gap);
                    padding-bottom: var(--gap);

                    &.column {
                        flex-direction: column;
                        min-height: var(--min-scroll-height);
                        overflow-y: scroll;
                        padding-right: var(--padding);
                    }
                }
                

                .friend {
                    width: 100%;
                    display: inline-flex;
                    gap: var(--gap);
                    align-items: center;

                    :global(.username) {
                        flex: 100%;
                        display: inline-flex;
                        width: 100%;
                        min-width: fit-content;
                        max-width: 100%;
                    }
                }
            }
        }
    }
</style>
