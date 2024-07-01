<script lang="ts">
    import { Appearance, ChatType, MessageAttachmentKind, MessagePosition, Route, Shape, Size, TooltipPosition } from "$lib/enums"
    import TimeAgo from "javascript-time-ago"
    import { initLocale } from "$lib/lang"
    import { mock_users } from "$lib/mock/users"
    import { _ } from "svelte-i18n"
    import { animationDuration } from "$lib/globals/animations"
    import { slide } from "svelte/transition"
    import { Chatbar, Sidebar, Topbar, Profile } from "$lib/layouts"
    import {
        FileEmbed,
        PopupButton,
        ImageEmbed,
        ChatPreview,
        NewPayment,
        Conversation,
        Message,
        MessageGroup,
        MessageReactions,
        MessageReplyContainer,
        ProfilePicture,
        CoinBalance,
        Modal,
        ProfilePictureMany,
        STLViewer,
        ChatFilter,
        ContextMenu,
        EmojiGroup,
    } from "$lib/components"
    import { Button, FileInput, Icon, Label, Text } from "$lib/elements"
    import CallScreen from "$lib/components/calling/CallScreen.svelte"
    import { OperationState, type Chat, type User } from "$lib/types"
    import EncryptedNotice from "$lib/components/messaging/EncryptedNotice.svelte"
    import { Store } from "$lib/state/Store"
    import { get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { UIStore } from "$lib/state/ui"
    import CreateGroup from "$lib/components/group/CreateGroup.svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import GroupSettings from "$lib/components/group/GroupSettings.svelte"
    import ViewMembers from "$lib/components/group/ViewMembers.svelte"
    import AudioEmbed from "$lib/components/messaging/embeds/AudioEmbed.svelte"
    import VideoEmbed from "$lib/components/messaging/embeds/VideoEmbed.svelte"
    import Market from "$lib/components/market/Market.svelte"
    import { log } from "$lib/utils/Logger"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import type { Attachment, Message as MessageType } from "$lib/types"
    import Input from "$lib/elements/Input/Input.svelte"
    import PendingMessage from "$lib/components/messaging/message/PendingMessage.svelte"
    import PendingMessageGroup from "$lib/components/messaging/PendingMessageGroup.svelte"
    import FileUploadPreview from "$lib/elements/FileUploadPreview.svelte"
    import { imageFromData } from "$lib/wasm/ConstellationStore"

    initLocale()

    let loading = false
    let contentAsideOpen = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let activeChat: Chat = get(Store.state.activeChat)
    let isFavorite = Store.isFavorite(activeChat)
    let conversation = ConversationStore.getConversation(activeChat)

    const timeAgo = new TimeAgo("en-US")

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    function getTimeAgo(dateInput: string | Date) {
        const date: Date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
        return timeAgo.format(date)
    }

    let previewImage: string | null
    let previewProfile: User | null
    let newGroup: boolean = false
    let showUsers: boolean = false
    let showMarket: boolean = false
    let groupSettings: boolean = false
    let search_filter: string
    let search_component: ChatFilter
    let dragging_files = 0
    let editing_message: string | undefined = undefined
    let editing_text: string | undefined = undefined
    let emojis: string[] = ["👍", "👎", "❤️", "🖖", "😂"]
    let own_user: User
    let replyTo: MessageType | undefined = undefined
    let fileUpload: FileInput
    let files: [File?, string?][] = []
    let browseFiles: boolean = false

    Store.state.user.subscribe(u => (own_user = u))
    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))
    let chats: Chat[] = get(UIStore.state.chats)
    UIStore.state.chats.subscribe(c => (chats = c))
    Store.state.activeChat.subscribe(c => {
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
    let pendingMessages = Object.values(ConversationStore.getPendingMessages(activeChat))
    ConversationStore.pendingMsgConversations.subscribe(_ => {
        pendingMessages = Object.values(ConversationStore.getPendingMessages(activeChat))
    })

    function dragEnter(event: DragEvent) {
        event.preventDefault()
        dragging_files++
    }

    function dragLeave() {
        dragging_files--
    }

    function dragDrop(event: DragEvent) {
        event.preventDefault()
        dragging_files = 0
        // upload files
        for (let file of event.dataTransfer?.files!) {
            files.push([file, undefined])
        }
        // Force an update
        files = files
    }

    function addFilesToUpload(selected: File[]) {
        for (let file of selected) {
            files.push([file, undefined])
        }
        // Force an update
        files = files
    }

    function build_context_items(message: MessageType) {
        return [
            {
                id: "pin-message",
                icon: Shape.Heart,
                text: "Pin Message",
                appearance: Appearance.Default,
                onClick: async () => {
                    await pin_message(message.id)
                },
            },
            {
                id: "reply",
                icon: Shape.ArrowLeft,
                text: "Reply",
                appearance: Appearance.Default,
                onClick: () => {
                    replyTo = message
                },
            },
            {
                id: "copy",
                icon: Shape.Clipboard,
                text: "Copy",
                appearance: Appearance.Default,
                onClick: () => {
                    copy(message.text.join("\n"))
                },
            },
            ...(message.details.origin.id === own_user.id
                ? [
                      {
                          id: "edit",
                          icon: Shape.Pencil,
                          text: "Edit",
                          appearance: Appearance.Default,
                          onClick: () => {
                              editing_message = message.id
                              editing_text = message.text.join("\n")
                          },
                      },
                      {
                          id: "delete",
                          icon: Shape.Trash,
                          text: "Delete",
                          appearance: Appearance.Default,
                          onClick: async () => {
                              await delete_message(message.id)
                          },
                      },
                  ]
                : []),
        ]
    }

    async function edit_message(message: string, text: string) {
        editing_message = undefined
        editing_text = undefined
        await RaygunStoreInstance.edit(conversation!.id, message, text.split("\n"))
    }

    async function delete_message(message: string) {
        await RaygunStoreInstance.delete(conversation!.id, message)
    }

    async function reactTo(message: string, emoji: string, toggle: boolean) {
        let add = toggle ? !ConversationStore.hasReaction(activeChat, message, emoji) : true
        await RaygunStoreInstance.react(conversation!.id, message, add ? 0 : 1, emoji)
    }

    async function pin_message(message: string) {
        await RaygunStoreInstance.pin(conversation!.id, message, true)
    }

    async function copy(txt: string) {
        await navigator.clipboard.writeText(txt)
    }

    async function download_attachment(message: string, attachment: Attachment) {
        await RaygunStoreInstance.downloadAttachment(conversation!.id, message, attachment.name)
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    id="page"
    on:dragover|preventDefault
    on:dragenter={e => {
        dragEnter(e)
    }}
    on:dragleave={dragLeave}
    on:drop={e => {
        dragDrop(e)
    }}>
    <!-- Modals -->
    {#if previewImage}
        <Modal
            on:close={_ => {
                previewImage = null
            }}>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}

    {#if previewProfile}
        <Modal
            on:close={_ => {
                previewProfile = null
            }}>
            <Profile user={previewProfile} />
        </Modal>
    {/if}

    {#if newGroup}
        <Modal
            on:close={_ => {
                newGroup = false
            }}>
            <CreateGroup on:create={_ => (newGroup = false)} />
        </Modal>
    {/if}

    {#if groupSettings}
        <Modal
            on:close={_ => {
                groupSettings = false
            }}>
            <GroupSettings on:create={_ => (groupSettings = false)} />
        </Modal>
    {/if}

    {#if showUsers}
        <Modal
            on:close={_ => {
                showUsers = false
            }}>
            <ViewMembers adminControls members={activeChat.users} on:create={_ => (showUsers = false)} />
        </Modal>
    {/if}

    {#if showMarket}
        <Market
            on:close={_ => {
                showMarket = false
            }} />
    {/if}

    {#if dragging_files > 0}
        <div class="upload-overlay">
            <div class="upload-element">
                <div class="dash-border"></div>
                <div class="upload-text">{$_("chat.upload_files")}</div>
            </div>
        </div>
    {/if}

    <!-- Sidebar -->
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Chat} bind:search={search_filter} on:search={() => search_component.filter_chat()} on:enter={() => search_component.select_first()}>
        <ChatFilter bind:this={search_component} bind:filter={search_filter}></ChatFilter>
        <!--
            <Button hook="button-marketplace" appearance={showMarket ? Appearance.Primary : Appearance.Alt} text={$_("market.market")} on:click={_ => (showMarket = true)}>
                <Icon icon={Shape.Shop} />
            </Button>
        -->
        <div class="content-header">
            <Label hook="label-sidebar-chats" text={$_("chat.chat_plural")} />
            <Button hook="button-create-group-chat" icon small tooltipPosition={TooltipPosition.LEFT} tooltip={$_("chat.create")} on:click={_ => (newGroup = true)}>
                <Icon icon={Shape.ChatPlus} />
            </Button>
        </div>

        {#each chats as chat}
            <ContextMenu
                items={[
                    {
                        id: "favorite",
                        icon: Shape.Heart,
                        text: "Favorite",
                        appearance: Appearance.Default,
                        onClick: () => Store.toggleFavorite(chat),
                    },
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
            <div slot="before">
                {#if activeChat.users.length > 0}
                    {#if activeChat.users.length === 2}
                        <ProfilePicture
                            typing={activeChat.activity}
                            image={activeChat.users[1]?.profile.photo.image}
                            frame={activeChat.users[2]?.profile.photo.frame}
                            status={activeChat.users[1]?.profile.status}
                            size={Size.Medium}
                            loading={loading} />
                    {:else}
                        <ProfilePictureMany users={activeChat.users} on:click={_ => (showUsers = true)} />
                    {/if}
                {/if}
            </div>
            <div slot="content">
                {#if activeChat.users.length > 0}
                    <Text singleLine>{activeChat.name.length ? activeChat.name : activeChat.users[1]?.name}</Text>
                    <Text singleLine muted size={Size.Smaller}>
                        {activeChat.motd.length ? activeChat.motd : activeChat.users[1]?.profile?.status_message}
                    </Text>
                {/if}
            </div>
            <svelte:fragment slot="controls">
                <CoinBalance balance={4560.53} />
                <Button icon appearance={Appearance.Alt} disabled={activeChat.users.length === 0}>
                    <Icon icon={Shape.PhoneCall} />
                </Button>
                <Button icon appearance={Appearance.Alt} disabled={activeChat.users.length === 0}>
                    <Icon icon={Shape.VideoCamera} />
                </Button>
                <Button
                    icon
                    disabled={activeChat.users.length === 0}
                    appearance={isFavorite ? Appearance.Primary : Appearance.Alt}
                    on:click={_ => {
                        Store.toggleFavorite(activeChat)
                    }}>
                    <Icon icon={Shape.Heart} />
                </Button>
                {#if activeChat.kind === ChatType.Group}
                    <Button
                        icon
                        appearance={showUsers ? Appearance.Primary : Appearance.Alt}
                        on:click={_ => {
                            showUsers = true
                        }}>
                        <Icon icon={Shape.Users} />
                    </Button>
                    <Button
                        icon
                        appearance={groupSettings ? Appearance.Primary : Appearance.Alt}
                        on:click={_ => {
                            groupSettings = true
                        }}>
                        <Icon icon={Shape.Cog} />
                    </Button>
                {/if}
                {#if activeChat.users.length === 1}
                    <Button
                        icon
                        appearance={contentAsideOpen ? Appearance.Primary : Appearance.Alt}
                        on:click={_ => {
                            contentAsideOpen = !contentAsideOpen
                        }}>
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
                        <MessageGroup
                            profilePictureRequirements={{
                                notifications: 0,
                                image: group.details.origin.profile.photo.image,
                                frame: group.details.origin.profile.photo.frame,
                                status: group.details.origin.profile.status,
                                highlight: Appearance.Default,
                            }}
                            on:profileClick={_ => {
                                previewProfile = group.details.origin
                            }}
                            remote={group.details.remote}
                            username={group.details.origin.name}
                            subtext={getTimeAgo(group.messages[0].details.at)}>
                            {#each group.messages as message, idx}
                                {#if message.inReplyTo}
                                    <MessageReplyContainer remote={message.inReplyTo.details.remote} image={message.inReplyTo.details.origin.profile.photo.image}>
                                        <Message reply remote={message.inReplyTo.details.remote}>
                                            {#each message.inReplyTo.text as line}
                                                <Text markdown={line} muted size={Size.Small} />
                                            {/each}
                                        </Message>
                                    </MessageReplyContainer>
                                {/if}
                                {#if message.text.length > 0 || message.attachments.length > 0}
                                    <ContextMenu items={build_context_items(message)}>
                                        <Message
                                            slot="content"
                                            let:open
                                            on:contextmenu={open}
                                            remote={group.details.remote}
                                            position={idx === 0 ? MessagePosition.First : idx === group.messages.length - 1 ? MessagePosition.Last : MessagePosition.Middle}
                                            morePadding={message.text.length > 1 || message.attachments.length > 0}>
                                            {#if editing_message === message.id}
                                                <Input alt bind:value={editing_text} autoFocus rich on:enter={_ => edit_message(message.id, editing_text ? editing_text : "")} />
                                            {:else}
                                                {#each message.text as line}
                                                    <Text markdown={line} />
                                                {/each}

                                                {#if message.attachments.length > 0}
                                                    {#each message.attachments as attachment}
                                                        {#if attachment.kind === MessageAttachmentKind.File || attachment.location.length == 0}
                                                            <FileEmbed
                                                                fileInfo={{
                                                                    id: "1",
                                                                    isRenaming: OperationState.Initial,
                                                                    source: "unknown",
                                                                    name: attachment.name,
                                                                    size: attachment.size,
                                                                    icon: Shape.Document,
                                                                    type: "unknown/unknown",
                                                                    remotePath: "",
                                                                }}
                                                                on:download={_ => download_attachment(message.id, attachment)} />
                                                        {:else if attachment.kind === MessageAttachmentKind.Image}
                                                            <ImageEmbed
                                                                source={attachment.location}
                                                                name={attachment.name}
                                                                filesize={attachment.size}
                                                                on:click={_ => {
                                                                    previewImage = attachment.location
                                                                }}
                                                                on:download={_ => download_attachment(message.id, attachment)} />
                                                        {:else if attachment.kind === MessageAttachmentKind.STL}
                                                            <STLViewer url={attachment.location} name={attachment.name} filesize={attachment.size} />
                                                        {:else if attachment.kind === MessageAttachmentKind.Audio}
                                                            <AudioEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                                        {:else if attachment.kind === MessageAttachmentKind.Video}
                                                            <VideoEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                                        {/if}
                                                    {/each}
                                                {/if}
                                            {/if}
                                        </Message>
                                        <svelte:fragment slot="items" let:close>
                                            <EmojiGroup emojis={emojis} emojiPick={emoji => reactTo(message.id, emoji, false)} close={close}></EmojiGroup>
                                        </svelte:fragment>
                                    </ContextMenu>
                                {/if}
                                {#if Object.keys(message.reactions).length > 0}
                                    <MessageReactions remote={group.details.remote} reactions={Object.values(message.reactions)} onClick={emoji => reactTo(message.id, emoji, true)} />
                                {/if}
                            {/each}
                        </MessageGroup>
                    {/each}
                    <PendingMessageGroup>
                        {#each pendingMessages as pending, idx}
                            <PendingMessage
                                message={pending}
                                position={idx === 0 ? MessagePosition.First : idx === pendingMessages.length - 1 ? MessagePosition.Last : MessagePosition.Middle}
                                on:abort={e => {
                                    if (Object.keys(get(pending.attachmentProgress)).length == 0) {
                                        ConversationStore.removePendingMessages(activeChat.id, e.detail.message)
                                    }
                                }}></PendingMessage>
                        {/each}
                    </PendingMessageGroup>
                {/if}
            {:else}
                <div class="add-someone" data-cy="section-add-someone">
                    <img src="/assets/mascot/better_with_friends.webp" class="better-with-friends" alt="Better with friends!" />
                    <Text>Let's get something started!</Text>
                    <Text muted centered>You don't have any active chats yet, click the button below to head to the friends page to start one.</Text>
                    <Button hook="button-add-friends" appearance={Appearance.Primary} text="Add Friends" on:click={_ => goto(Route.Friends)}>
                        <Icon icon={Shape.Users} />
                    </Button>
                </div>
            {/if}
        </Conversation>

        {#if files.length > 0}
            <FileUploadPreview filesSelected={files} />
        {/if}

        {#if activeChat.users.length > 0}
            <Chatbar filesSelected={files} replyTo={replyTo} on:onsend={_ => (files = [])}>
                <svelte:fragment slot="pre-controls">
                    <FileInput bind:this={fileUpload} hidden on:select={e => addFilesToUpload(e.detail)} />
                    <ContextMenu
                        items={[
                            {
                                id: "upload",
                                icon: Shape.ArrowUp,
                                text: "Upload",
                                appearance: Appearance.Default,
                                onClick: () => {
                                    fileUpload.click()
                                },
                            },
                            {
                                id: "from_files",
                                icon: Shape.Eye,
                                text: "Browse Files",
                                appearance: Appearance.Default,
                                onClick: () => {},
                            },
                        ]}>
                        <Button slot="content" let:open on:click={open} on:contextmenu={open} icon appearance={Appearance.Alt} tooltip={$_("chat.add_attachment")}>
                            <Icon icon={Shape.Plus} />
                        </Button>
                    </ContextMenu>
                </svelte:fragment>

                <PopupButton name={$_("payments.send_coin")}>
                    <NewPayment recipients={mock_users} />
                    <div slot="icon" class="control">
                        <Icon icon={Shape.Starlight} size={Size.Large} />
                    </div>
                </PopupButton>
            </Chatbar>
        {/if}
    </div>
    {#if contentAsideOpen}
        <!-- All aside menus should render from this element. Please display only one at a time. -->
        <div class="aside" transition:slide={{ duration: animationDuration, axis: "x" }}>
            <Profile user={activeChat.users[0]} />
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
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            flex: 1;
            transition: all var(--animation-duration);
            min-width: 0;

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
                margin-top: var(--gap);
            }
        }

        .aside {
            border-left: var(--border-width) solid var(--border-color);
        }

        .upload-overlay {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            z-index: 4;
            .upload-element {
                position: fixed;
                display: flex;
                justify-content: center;
                align-items: center;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 5;
                width: calc(var(--sidebar-width) - (var(--gap) * 2));
                height: 200px;
                border-radius: var(--border-width);
                background-color: var(--background-alt);

                .upload-text {
                    z-index: 3;
                    pointer-events: none;
                    text-align: center;
                    font-size: var(--font-size);
                    color: var(--color);
                }
            }
            .dash-border {
                background: transparent;
                position: absolute;
                top: 12px;
                left: 12px;
                right: 12px;
                bottom: 12px;
                background-image: linear-gradient(90deg, var(--color) 50%, transparent 50%), linear-gradient(90deg, var(--color) 50%, transparent 50%), linear-gradient(0deg, var(--color) 50%, transparent 50%),
                    linear-gradient(0deg, var(--color) 50%, transparent 50%);
                background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
                background-size:
                    15px 3px,
                    15px 3px,
                    3px 15px,
                    3px 15px;
                background-position:
                    left top,
                    right bottom,
                    left bottom,
                    right top;
                animation: 0.5s linear infinite border-dance;

                @keyframes border-dance {
                    0% {
                        background-position:
                            left top,
                            right bottom,
                            left bottom,
                            right top;
                    }
                    100% {
                        background-position:
                            left 15px top,
                            right 15px bottom,
                            left bottom 15px,
                            right top 15px;
                    }
                }
            }
        }
    }

    .add-someone {
        .better-with-friends {
            max-width: 400px;
        }
    }

    @media (max-width: 800px) {
        .add-someone {
            .better-with-friends {
                max-width: 100%;
            }
        }
    }
</style>
