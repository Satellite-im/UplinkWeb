<script lang="ts">
    import { Appearance, MessageAttachmentKind, MessagePosition, Route, Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { mock_users } from "$lib/mock/users"
    import { _ } from "svelte-i18n"
    import { animationDuration } from "$lib/globals/animations"
    import { slide } from "svelte/transition"
    import { Chatbar, Sidebar, Slimbar, Topbar, Profile } from "$lib/layouts"
    import { 
        FileEmbed, PopupButton, ImageEmbed, ChatPreview, NewPayment, Conversation, 
        Message, MessageGroup, MessageReactions, MessageReplyContainer, 
        ProfilePicture, CoinBalance, Modal , ProfilePictureMany
    } from "$lib/components"
    import { Button, Icon, Label, Text } from "$lib/elements"
    import ContextMenu from "$lib/components/ui/ContextMenu.svelte"
    import CallScreen from "$lib/components/calling/CallScreen.svelte"
    import { type Chat, type ContextItem, type User } from "$lib/types"
    import EncryptedNotice from "$lib/components/messaging/EncryptedNotice.svelte"
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { UIStore } from "$lib/state/ui";

    initLocale()

    let loading = false
    let contentAsideOpen = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let activeChat: Chat = get(Store.state.activeChat)
    let isFavorite = Store.isFavorite(activeChat)
    let conversation = get(Store.state.activeChat).conversation

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    // TODO: Move this into a global state
    let previewImage: string | null
    let previewProfile: User | null
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []

    UIStore.state.sidebarOpen.subscribe((s) => sidebarOpen = s)
    let chats: Chat[] = get(UIStore.state.chats)
    UIStore.state.chats.subscribe((c) => chats = c)
    Store.state.activeChat.subscribe((c) => {
        activeChat = c
        conversation = c.conversation
        isFavorite = get(Store.state.favorites).some(f => f.id === activeChat.id)
        contentAsideOpen = false
    })
    Store.state.favorites.subscribe(f => {
        isFavorite = get(Store.state.favorites).some(f => f.id === activeChat.id)
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

    <!-- Sidebar -->
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Chat}>
        
    </Slimbar>
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
                chat={chat}
                loading={loading}
                simpleUnreads
                cta={activeChat === chat}
                on:context={(evt) => {
                    contextPosition = evt.detail
                    contextData = [
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
                            status={activeChat.users[0]?.profile.status} 
                            size={Size.Medium} 
                            loading={loading} />
                    {:else}
                        <ProfilePictureMany users={activeChat.users} />
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
                    {#each conversation as group}
                        <MessageGroup profilePictureRequirements={{
                            notifications: 0,
                            image: group.details.origin.profile.photo.image,
                            status: group.details.origin.profile.status,
                            highlight: Appearance.Default
                        }}
                        on:profileClick={(_) => {
                            previewProfile = group.details.origin
                        }}
                        remote={group.details.remote}
                        subtext="Sent 3 minutes ago.">
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
                        <Icon icon={Shape.SendCoin} />
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