<script lang="ts">
    import ChatPreview from "$lib/components/ChatPreview.svelte"
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Label from "$lib/elements/Label.svelte"
    import Text from "$lib/elements/Text.svelte"
    import { Appearance, Route, Shape, Size, Status } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import ProfilePicture from "$lib/components/ProfilePicture.svelte"
    import Input from "$lib/elements/Input.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { chats, mock_users } from "$lib/mock/users"
    import { onMount } from "svelte"
    import { _ } from 'svelte-i18n'
    import Topbar from "$lib/layouts/Topbar.svelte"
    import type { User } from "$lib/types";

    // Initialize locale
    initLocale()

    let loading: boolean = true
    let sidebarOpen: boolean = true

    // Mock loading behavior
    onMount(() => {
        setTimeout(() => loading = false, 1500)
    })

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
</script>

<div id="chat">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Chat} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Friends} >
        <Button outline appearance={Appearance.Alt} text="Market">
            <Icon icon={Shape.Shop} />
        </Button>
        

        <div class="content-header">
            <Label text="Chats" />
            <Button icon small tooltip="Create Chat">
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
                message={chat.last_message_preview} />
        {/each}
    </Sidebar>
    <div class="content">
        <Topbar>
            <div slot="controls">
                <Button appearance={Appearance.Primary} text="All">
                    <Icon icon={Shape.Users} />
                </Button>
                <Button appearance={Appearance.Alt} text="Incoming">
                    <Icon icon={Shape.ArrowRight} />
                </Button>
                <Button appearance={Appearance.Alt} text="Blocked">
                    <Icon icon={Shape.NoSymbol} />
                </Button>
            </div>
        </Topbar>

        <div class="body">
            <Label text="Add Someone" />
            <div class="section">
                <Input alt placeholder="Find Username#xxxxxx . . .">
                    <Icon icon={Shape.Search} />
                </Input>
                <Button appearance={Appearance.Alt} text="Add">
                    <Icon icon={Shape.Plus} />
                </Button>
                <Button appearance={Appearance.Alt} icon tooltip="Copy ID">
                    <Icon icon={Shape.Clipboard} />
                </Button>
            </div>

            <Label text="Search Friends" />
            <div class="section">
                <Input alt placeholder="Search your friends . . .">
                    <Icon icon={Shape.Search} />
                </Input>
            </div>
            <div class="section column">
                {#each Object.keys(groupUsersAlphabetically(mock_users)).sort() as letter}
                    {#if groupUsersAlphabetically(mock_users)[letter].length > 0}
                        <Label text={letter} />
                        {#each groupUsersAlphabetically(mock_users)[letter] as friend}
                            <div class="friend">
                                <ProfilePicture size={Size.Small} image={friend.profile.photo.image} status={friend.profile.status} />
                                <Text class="username">{friend.name}</Text>
                                <div class="controls">
                                    <Button text="Chat">
                                        <Icon icon={Shape.ChatBubble} />
                                    </Button>
                                    <Button icon appearance={Appearance.Alt} tooltip="Remove">
                                        <Icon icon={Shape.UserMinus} />
                                    </Button>
                                    <Button icon appearance={Appearance.Alt} tooltip="Block">
                                        <Icon icon={Shape.NoSymbol} />
                                    </Button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                {/each}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    #chat {
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

                    .controls {
                        display: inline-flex;
                        gap: var(--gap-less);
                    }
                }
            }
        }
    }
</style>
