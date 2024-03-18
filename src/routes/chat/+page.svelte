<script lang="ts">
    import { Appearance, MessagePosition, Route, Shape, Size, Status } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { chats, mock_users } from "$lib/mock/users"
    import { _ } from 'svelte-i18n'
    import { animationDuration } from "$lib/globals/animations"
    import { slide } from "svelte/transition"

    import { Chatbar, Sidebar, Slimbar, Topbar, Profile } from "$lib/layouts"
    import { ChatPreview, NewPayment, Conversation, Message, MessageContainer, MessageGroup, MessageReactions, MessageReplyContainer, ProfilePicture, CoinBalance } from "$lib/components"
    import { Button, Icon, Label, Text } from "$lib/elements"
    import PopupButton from "$lib/components/PopupButton.svelte";
    import ContextMenu from "$lib/components/ContextMenu.svelte";

    initLocale()

    let loading = false
    let sidebarOpen = true
    let contentAsideOpen = false

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen
    }
</script>

<div id="page">
    <ContextMenu items={[
        {
            id: "something_1",
            icon: Shape.Beaker,
            text: "Something",
        },
        {
            id: "something_1",
            icon: Shape.Beaker,
            text: "Something",
        },
        {
            id: "something_1",
            icon: Shape.Beaker,
            text: "Something",
        },
        {
            id: "something_1",
            icon: Shape.Beaker,
            text: "Something",
        }
    ]}>
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button icon appearance={Appearance.Alt}>
            <Icon icon={Shape.Plus} />
        </Button>
    </ContextMenu>
    
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Chat} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Chat} >
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
                message={chat.last_message_preview} />
        {/each}
    </Sidebar>
    <div class="content">
        <Topbar>
            <div slot="before">
                <ProfilePicture 
                    image={mock_users[0].profile.photo.image} 
                    size={Size.Small} 
                    status={mock_users[0].profile.status} />
            </div>
            <div slot="content">
                <Text singleLine>{mock_users[0].name}</Text>
                <Text singleLine muted size={Size.Smaller}>{mock_users[0].profile.status_message}</Text>
            </div>
            <div slot="controls">
                <CoinBalance balance={4560.53} />
                <Button icon appearance={Appearance.Alt}>
                    <Icon icon={Shape.PhoneCall} />
                </Button>
                <Button icon appearance={Appearance.Alt}>
                    <Icon icon={Shape.VideoCamera} />
                </Button>
                <Button icon appearance={Appearance.Alt}>
                    <Icon icon={Shape.Heart} />
                </Button>
                <Button icon appearance={contentAsideOpen ? Appearance.Primary : Appearance.Alt} on:click={
                    (_) => {
                        contentAsideOpen = !contentAsideOpen;
                    }
                }>
                    <Icon icon={Shape.Profile} />
                </Button>
            </div>
        </Topbar>
        <Conversation>
            <MessageGroup profilePictureRequirements={{
                notifications: 0,
                image: "/src/lib/assets/mars.png",
                status: Status.DoNotDisturb,
                highlight: Appearance.Default
            }}
            subtext="Sent 3 minutes ago.">
                <MessageContainer>
                    <Message position={MessagePosition.First}>Hello, world!</Message>
                    <MessageReactions reactions={[
                        {
                            emoji: "🔥",
                            highlight: Appearance.Primary,
                            count: 3,
                            description: ":fire: you and 2 users reacted.",
                        },
                        {
                            emoji: "🌎",
                            highlight: Appearance.Default,
                            count: 2,
                            description: ":earth: 2 users reacted.",
                        }
                    ]}/>
                </MessageContainer>
                <MessageContainer>
                    <Message>This is another message.</Message>
                </MessageContainer>
                <MessageContainer>
                    <Message position={MessagePosition.Last}>And one last message!</Message>
                </MessageContainer>
            </MessageGroup>

            <MessageGroup remote profilePictureRequirements={{
                notifications: 0,
                image: "/src/lib/assets/moon.png",
                status: Status.Online,
                highlight: Appearance.Default
            }}
            subtext="Sent 2 minutes ago.">
                <MessageContainer>
                    <Message remote position={MessagePosition.First}>Hello humans.</Message>
                    <MessageReactions remote reactions={[
                        {
                            emoji: "👽",
                            highlight: Appearance.Default,
                            count: 2,
                            description: ":alien: 2 users reacted."
                        },
                        {
                            emoji: "👀",
                            highlight: Appearance.Default,
                            count: 1,
                            description: ":eyes: 1 user reacted."
                        }
                    ]}/>
                </MessageContainer>
                <MessageContainer>
                    <Message remote>I am not an alien.</Message>
                </MessageContainer>
                <MessageContainer>
                    <Message remote position={MessagePosition.Last}>Unless I am, oOoo who knows!?</Message>
                </MessageContainer>
            </MessageGroup>

            <MessageGroup profilePictureRequirements={{
                notifications: 0,
                image: "/src/lib/assets/mars.png",
                status: Status.DoNotDisturb,
                highlight: Appearance.Default
            }}
            subtext="Sent 1 minutes ago.">
                <MessageContainer>
                    <MessageReplyContainer
                        remote
                        image="/src/lib/assets/moon.png">
                        <Message reply remote localSide position={MessagePosition.First}>I am not an alien.</Message>
                    </MessageReplyContainer>
                    <Message position={MessagePosition.Last}>Hmm, okay!</Message>
                </MessageContainer>
            </MessageGroup>
        </Conversation>
        <Chatbar>
            <PopupButton name={$_("payments.send_coin")}>
                <NewPayment recipients={mock_users}/>
                <div slot="icon" class="control">
                    <Icon icon={Shape.SendCoin} />
                </div>
            </PopupButton>
        </Chatbar>
    </div>
    {#if contentAsideOpen}
        <!-- All aside menus should render from this element. Please display only one at a time. -->
        <div class="aside" transition:slide={{duration: animationDuration, axis: "x"}}>
            <Profile user={mock_users[0]}/>
        </div>
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
        }

        .aside {
            border-left: var(--border-width) solid var(--border-color);
        }
        
    }
</style>