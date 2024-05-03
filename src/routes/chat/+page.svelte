<script lang="ts">
    import { Appearance, ChatType, MessageAttachmentKind, MessagePosition, Route, Shape, Size } from "$lib/enums"
    import TimeAgo from "javascript-time-ago"
    import { initLocale } from "$lib/lang"
    import { mock_users } from "$lib/mock/users"
    import { _ } from "svelte-i18n"
    import { animationDuration } from "$lib/globals/animations"
    import { slide } from "svelte/transition"
    import { Chatbar, Sidebar, Slimbar, Topbar, Profile } from "$lib/layouts"
    import { 
        FileEmbed, PopupButton, ImageEmbed, ChatPreview, NewPayment, Conversation, 
        Message, MessageGroup, MessageReactions, MessageReplyContainer, 
        ProfilePicture, CoinBalance, Modal , ProfilePictureMany, STLViewer

    } from "$lib/components"
    import { Button, Icon, Label, Text } from "$lib/elements"
    import ContextMenu from "$lib/components/ui/ContextMenu.svelte"
    import CallScreen from "$lib/components/calling/CallScreen.svelte"
    import { type Chat, type ContextItem, type User } from "$lib/types"
    import EncryptedNotice from "$lib/components/messaging/EncryptedNotice.svelte"
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { UIStore } from "$lib/state/ui"
    import CreateGroup from "$lib/components/group/CreateGroup.svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import GroupSettings from "$lib/components/group/GroupSettings.svelte"
    import ViewMembers from "$lib/components/group/ViewMembers.svelte";
    import AudioEmbed from "$lib/components/messaging/embeds/AudioEmbed.svelte";
    import VideoEmbed from "$lib/components/messaging/embeds/VideoEmbed.svelte";
    import Market from "$lib/components/market/Market.svelte";

    initLocale()

    let loading = false
    let contentAsideOpen = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let activeChat: Chat = get(Store.state.activeChat)
    let isFavorite = Store.isFavorite(activeChat)
    let conversation = ConversationStore.getConversation(activeChat)

    const timeAgo = new TimeAgo('en-US')

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    function getTimeAgo(dateInput: string | Date) {
        const date: Date = (typeof dateInput === 'string') ? new Date(dateInput) : dateInput
        return timeAgo.format(date)
    }

    let previewImage: string | null
    let previewProfile: User | null
    let newGroup: boolean = false
    let showUsers: boolean = false
    let showMarket: boolean = false
    let groupSettings: boolean = false
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []

    UIStore.state.sidebarOpen.subscribe((s) => sidebarOpen = s)
    let chats: Chat[] = get(UIStore.state.chats)
    UIStore.state.chats.subscribe((c) => chats = c)
    Store.state.activeChat.subscribe((c) => {
        activeChat = c
        conversation = ConversationStore.getConversation(c)
        isFavorite = get(Store.state.favorites).some(f => f.id === activeChat.id)
        contentAsideOpen = false
    })
    Store.state.favorites.subscribe(f => {
        isFavorite = get(Store.state.favorites).some(f => f.id === activeChat.id)
    })
    ConversationStore.conversations.subscribe(_ => {
        conversation = ConversationStore.getConversation(activeChat)
    })
</script>

<div id="page">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <!-- Modals -->
    {#if previewImage}
        <Modal on:close={(_) => {previewImage = null}}>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}

    {#if previewProfile}
        <Modal on:close={(_) => {previewProfile = null}}>
            <Profile user={previewProfile} />
        </Modal>
    {/if}

    {#if newGroup}
        <Modal on:close={(_) => {newGroup = false}}>
            <CreateGroup on:create={(_) => newGroup = false}/> 
        </Modal>
    {/if}

    {#if groupSettings}
        <Modal on:close={(_) => {groupSettings = false}}>
            <GroupSettings on:create={(_) => groupSettings = false}/> 
        </Modal>
    {/if}

    {#if showUsers}
        <Modal on:close={(_) => {showUsers = false}}>
            <ViewMembers 
                adminControls 
                members={activeChat.users} 
                on:create={(_) => showUsers = false} /> 
        </Modal>
    {/if}

    {#if showMarket}
        <Market on:close={(_) => {showMarket = false}}/>
    {/if}

    <!-- Sidebar -->
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Chat}></Slimbar>

    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Chat}>
        <Button appearance={showMarket ? Appearance.Primary : Appearance.Alt} text={$_("market.market")} on:click={(_) => showMarket = true}>
            <Icon icon={Shape.Shop} />
        </Button>

        <div class="content-header">
            <Label text={$_("chat.chat_plural")} />
            <Button icon small tooltip={$_("chat.create")} on:click={(_) => newGroup = true}>
                <Icon icon={Shape.ChatPlus} />
            </Button>
        </div>

        {#each chats as chat}
            <ChatPreview
                chat={chat}
                loading={loading}
                simpleUnreads
                cta={activeChat === chat}
                on:context={(evt) => {
                    contextPosition = evt.detail
                    contextData = [
                        {
                            id: "favorite",
                            icon: Shape.Heart,
                            text: "Favorite",
                            appearance: Appearance.Default,
                            onClick: () => Store.toggleFavorite(chat)
                        },
                        {
                            id: "hide",
                            icon: Shape.EyeSlash,
                            text: "Hide",
                            appearance: Appearance.Default,
                            onClick: () => UIStore.removeSidebarChat(chat)
                        },
                        {
                            id: "mark_read",
                            icon: Shape.CheckMark,
                            text: "Mark Read",
                            appearance: Appearance.Default,
                            onClick: () => {}
                        },
                    ]
                }} />
        {/each}
    </Sidebar>

    <div class="content">
        <Topbar>
            <div slot="before">
                {#if activeChat.users.length > 0}
                    {#if activeChat.users.length === 1}
                        <ProfilePicture 
                            typing={activeChat.activity} 
                            image={activeChat.users[0]?.profile.photo.image}
                            frame={activeChat.users[0]?.profile.photo.frame}
                            status={activeChat.users[0]?.profile.status} 
                            size={Size.Medium} 
                            loading={loading} />
                    {:else}
                        <ProfilePictureMany users={activeChat.users} on:click={(_) => showUsers = true}/>
                    {/if}
                {/if}
            </div>
            <div slot="content">
                {#if activeChat.users.length > 0}
                    <Text singleLine>{(activeChat.name.length) ? activeChat.name : activeChat.users[0]?.name}</Text>
                    <Text singleLine muted size={Size.Smaller}>
                        {(activeChat.motd.length) ? activeChat.motd : activeChat.users[0]?.profile?.status_message}
                    </Text>
                {/if}
            </div>
            <svelte:fragment slot="controls">
                <CoinBalance balance={4560.53} />
                <Button 
                    icon 
                    appearance={Appearance.Alt} 
                    disabled={activeChat.users.length === 0}>
                    <Icon icon={Shape.PhoneCall} />
                </Button>
                <Button 
                    icon 
                    appearance={Appearance.Alt} 
                    disabled={activeChat.users.length === 0}>
                    <Icon icon={Shape.VideoCamera} />
                </Button>
                <Button 
                    icon 
                    disabled={activeChat.users.length === 0}
                    appearance={isFavorite ? Appearance.Primary : Appearance.Alt}
                    on:click={(_) => {Store.toggleFavorite(activeChat)}}>
                    <Icon icon={Shape.Heart} />
                </Button>
                {#if activeChat.kind === ChatType.Group}
                    <Button 
                        icon 
                        appearance={(showUsers) ? Appearance.Primary : Appearance.Alt}
                        on:click={(_) => {showUsers = true}}>
                        <Icon icon={Shape.Users} />
                    </Button>
                    <Button 
                        icon 
                        appearance={(groupSettings) ? Appearance.Primary : Appearance.Alt}
                        on:click={(_) => {groupSettings = true}}>
                        <Icon icon={Shape.Cog} />
                    </Button>
                {/if}
                {#if activeChat.users.length === 1}
                    <Button 
                        icon 
                        appearance={contentAsideOpen ? Appearance.Primary : Appearance.Alt} 
                        on:click={
                        (_) => {
                            contentAsideOpen = !contentAsideOpen;
                        }
                    }>
                        <Icon icon={Shape.Profile} />
                    </Button>
                {/if}
            </svelte:fragment>
        </Topbar>

        {#if get(Store.state.activeCall)}
            <CallScreen />
        {/if}

        <Conversation>
            {#if activeChat.users.length > 0}
                <EncryptedNotice />
                {#if conversation}
                    {#each conversation.messages as group}
                        <MessageGroup profilePictureRequirements={{
                            notifications: 0,
                            image: group.details.origin.profile.photo.image,
                            frame: group.details.origin.profile.photo.frame,
                            status: group.details.origin.profile.status,
                            highlight: Appearance.Default
                        }}
                        on:profileClick={(_) => {
                            previewProfile = group.details.origin
                        }}
                        remote={group.details.remote}
                        subtext={getTimeAgo(group.messages[0].details.at)}>
                            {#each group.messages as message, idx}
                                {#if message.inReplyTo}
                                    <MessageReplyContainer
                                        remote={message.inReplyTo.details.remote}
                                        image={message.inReplyTo.details.origin.profile.photo.image}
                                    >
                                        <Message
                                            reply
                                            remote={message.inReplyTo.details.remote}
                                        >
                                        {#each message.inReplyTo.text as line}
                                            <Text markdown={line} muted size={Size.Small}/>
                                        {/each}
                                        </Message>
                                    </MessageReplyContainer>
                                {/if}
                                {#if message.text.length > 0 || message.attachments.length > 0}
                                    <Message
                                        on:context={(evt) => {
                                            contextPosition = evt.detail
                                            contextData = [
                                                {
                                                    id: "something_1",
                                                    icon: Shape.Beaker,
                                                    text: "Placeholder",
                                                    appearance: Appearance.Default,
                                                    onClick: () => {}
                                                }
                                            ]
                                        }}
                                        remote={group.details.remote}
                                        position={
                                            (idx === 0) ?
                                                MessagePosition.First : 
                                                (idx === group.messages.length - 1) ?  
                                                    MessagePosition.Last :
                                                        MessagePosition.Middle
                                        }
                                        morePadding={message.text.length > 1 || message.attachments.length > 0}
                                        >
            
                                        {#each message.text as line}
                                            <Text markdown={line} />
                                        {/each}

                                        {#if message.attachments.length > 0}
                                            {#each message.attachments as attachment}
                                                {#if attachment.kind === MessageAttachmentKind.Image}
                                                    <ImageEmbed
                                                        source={attachment.location}
                                                        name={attachment.name}
                                                        filesize={attachment.size}
                                                        on:click={(_) => {
                                                            previewImage = attachment.location
                                                        }}/>
                                                {:else if attachment.kind === MessageAttachmentKind.File}
                                                    <FileEmbed />
                                                {:else if attachment.kind === MessageAttachmentKind.STL}
                                                    <STLViewer url={attachment.location} name={attachment.name} filesize={attachment.size}/>
                                                {:else if attachment.kind === MessageAttachmentKind.Audio}
                                                    <AudioEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                                {:else if attachment.kind === MessageAttachmentKind.Video}
                                                    <VideoEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                                {/if}
                                            {/each}
                                        {/if}
                                    </Message>
                                {/if}
                                {#if message.reactions.length > 0}
                                    <MessageReactions remote={group.details.remote} reactions={message.reactions} />
                                {/if}
                            {/each}
                        </MessageGroup>
                    {/each}
                {/if}
            {:else}
                <div class="add-someone">
                    <img src="/assets/mascot/better_with_friends.webp" style="max-width: 350px;" alt="Better with friends!"/>
                    <Text>Let's get something started!</Text>
                    <Text muted>You don't have any active chats yet, click the button below to head to the friends page to start one.</Text>
                    <Button
                        appearance={Appearance.Primary}
                        text="Add Friends"
                        on:click={(_) => goto(Route.Friends)}>
                        <Icon icon={Shape.Users} />
                    </Button>
                </div>
            {/if}
        </Conversation>
        

        {#if activeChat.users.length > 0}
            <Chatbar>
                <svelte:fragment slot="pre-controls">
                    <Button 
                        icon 
                        appearance={Appearance.Alt} 
                        tooltip={$_("chat.add_attachment")}
                        on:context={(evt) => {
                            contextPosition = evt.detail
                            contextData = [
                                {
                                    id: "upload",
                                    icon: Shape.ArrowUp,
                                    text: "Upload",
                                    appearance: Appearance.Default,
                                    onClick: () => {}
                                },
                                {
                                    id: "from_files",
                                    icon: Shape.Eye,
                                    text: "Browse Files",
                                    appearance: Appearance.Default,
                                    onClick: () => {}
                                },
                            ]
                        }}>
                        <Icon icon={Shape.Plus} />
                    </Button>
                </svelte:fragment>

                <PopupButton name={$_("payments.send_coin")}>
                    <NewPayment recipients={mock_users}/>
                    <div slot="icon" class="control">
                        <Icon icon={Shape.Starlight} size={Size.Large} />
                    </div>
                </PopupButton>
            </Chatbar>
        {/if}
    </div>
    {#if contentAsideOpen}
        <!-- All aside menus should render from this element. Please display only one at a time. -->
        <div class="aside" transition:slide={{duration: animationDuration, axis: "x"}}>
            <Profile user={activeChat.users[0]}/>
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
            transition: all var(--animation-duration);


            .add-someone {
                position: absolute;
                top: var(--padding);
                left: var(--padding);
                right: var(--padding);
                background: var(--alt-color);
                border-radius: var(--border-radius);
                padding: var(--padding);
                display: inline-flex;
                flex-direction: column;
                gap: var(--gap-less);
                justify-content: center;
                align-items: center;
                border: var(--border-width) solid var(--primary-color);
            }
        }

        .aside {
            border-left: var(--border-width) solid var(--border-color);
        }
        
    }
</style>