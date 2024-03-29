<script lang="ts">  
    import { Button, Icon, Label, Text, Input } from "$lib/elements"
    import { ChatPreview, ContextMenu, ProfilePicture } from "$lib/components"
    import { Sidebar, Slimbar, Topbar } from "$lib/layouts"
    import { Appearance, Route, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { blocked_users, chats, fake_user_array, mock_users } from "$lib/mock/users"
    import type { ContextItem, User } from "$lib/types"
    import Controls from "$lib/layouts/Controls.svelte"

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
</script>

<div id="page">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

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
                    <Input alt placeholder={$_("friends.find_placeholder")}>
                        <Icon icon={Shape.Search} />
                    </Input>
                    <Button appearance={Appearance.Alt} text={$_("friends.add")}>
                        <Icon icon={Shape.Plus} />
                    </Button>
                    <Button appearance={Appearance.Alt} icon tooltip={$_("friends.copy_did")}>
                        <Icon icon={Shape.Clipboard} />
                    </Button>
                </div>

                <Label text={$_("friends.search_friends_placeholder")} />
                <div class="section">
                    <Input alt placeholder={$_("friends.search_friends_placeholder")}>
                        <Icon icon={Shape.Search} />
                    </Input>
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
