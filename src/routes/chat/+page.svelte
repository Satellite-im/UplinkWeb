<script lang="ts">
    import { Appearance, MessageAttachmentKind, MessagePosition, Route, Shape, Size, Status } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { chats, mock_users } from "$lib/mock/users"
    import { _ } from 'svelte-i18n'
    import { animationDuration } from "$lib/globals/animations"
    import { slide } from "svelte/transition"

    import { Chatbar, Sidebar, Slimbar, Topbar, Profile } from "$lib/layouts"
    import { 
        FileEmbed, PopupButton, ImageEmbed, ChatPreview, NewPayment, Conversation, 
        Message, MessageGroup, MessageReactions, MessageReplyContainer, 
        ProfilePicture, CoinBalance, Modal 
    } from "$lib/components"
    import { Button, Icon, Label, Text } from "$lib/elements"
    import ContextMenu from "$lib/components/ui/ContextMenu.svelte"
    import CallScreen from "$lib/components/calling/CallScreen.svelte";
    import type { ContextItem } from "$lib/types";
    import { mock_messages } from "$lib/mock/messages";

    initLocale()

    let loading = false
    let sidebarOpen = true
    let contentAsideOpen = false
    let conversation = mock_messages

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen
    }

    let previewImage: string | null
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []
</script>

<div id="page">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <!-- Modals -->
    {#if previewImage}
        <Modal on:close={(_) => {previewImage = null}}>
            <svelte:fragment slot="controls">
                <Button 
                    icon 
                    small 
                    appearance={Appearance.Alt}
                    on:click={(_) => {previewImage = null}}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}

    <!-- Sidebar -->
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
            <svelte:fragment slot="controls">
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
            </svelte:fragment>
        </Topbar>

        <CallScreen />

        <Conversation>
            {#each conversation as group}
                <MessageGroup profilePictureRequirements={{
                    notifications: 0,
                    image: group.details.origin.profile.photo.image,
                    status: group.details.origin.profile.status,
                    highlight: Appearance.Default
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
                                            appearance: Appearance.Default
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
            transition: all var(--animation-duration);
        }

        .aside {
            border-left: var(--border-width) solid var(--border-color);
        }
        
    }
</style>