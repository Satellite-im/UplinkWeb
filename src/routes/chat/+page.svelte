<script lang="ts">
    import { VoiceRTCInstance, VoiceRTCMessageType } from "./../../lib/media/Voice"
    import { Appearance, ChatType, MessageAttachmentKind, MessagePosition, Route, Shape, Size, TooltipPosition } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import { animationDuration } from "$lib/globals/animations"
    import { slide } from "svelte/transition"
    import { Chatbar, Sidebar, Topbar, Profile } from "$lib/layouts"
    import {
        FileEmbed,
        ImageEmbed,
        ChatPreview,
        Conversation,
        Message,
        MessageGroup,
        MessageReactions,
        MessageReplyContainer,
        ProfilePicture,
        Modal,
        ProfilePictureMany,
        STLViewer,
        ChatFilter,
        ContextMenu,
        EmojiGroup,
    } from "$lib/components"
    import CreateTransaction from "$lib/components/wallet/CreateTransaction.svelte"
    import { Button, FileInput, Icon, Label, Text } from "$lib/elements"
    import CallScreen from "$lib/components/calling/CallScreen.svelte"
    import { OperationState } from "$lib/types"
    import EncryptedNotice from "$lib/components/messaging/EncryptedNotice.svelte"
    import { Store } from "$lib/state/Store"
    import { derived, get } from "svelte/store"
    import { goto } from "$app/navigation"
    import { UIStore } from "$lib/state/ui"
    import CreateGroup from "$lib/components/group/CreateGroup.svelte"
    import { ConversationStore, type ConversationMessages } from "$lib/state/conversation"
    import GroupSettings from "$lib/components/group/GroupSettings.svelte"
    import ViewMembers from "$lib/components/group/ViewMembers.svelte"
    import AudioEmbed from "$lib/components/messaging/embeds/AudioEmbed.svelte"
    import VideoEmbed from "$lib/components/messaging/embeds/VideoEmbed.svelte"
    import Market from "$lib/components/market/Market.svelte"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import type { Attachment, Message as MessageType, User } from "$lib/types"
    import Input from "$lib/elements/Input/Input.svelte"
    import PendingMessage from "$lib/components/messaging/message/PendingMessage.svelte"
    import PendingMessageGroup from "$lib/components/messaging/PendingMessageGroup.svelte"
    import FileUploadPreview from "$lib/elements/FileUploadPreview.svelte"
    import TextDocument from "$lib/components/messaging/embeds/TextDocument.svelte"
    import StoreResolver from "$lib/components/utils/StoreResolver.svelte"
    import { getValidPaymentRequest } from "$lib/utils/Wallet"
    import { onMount } from "svelte"
    import PinnedMessages from "$lib/components/messaging/PinnedMessages.svelte"
    import { MessageEvent } from "warp-wasm"
    import { debounce, getTimeAgo } from "$lib/utils/Functions"
    import Controls from "$lib/layouts/Controls.svelte"
    import { tempCDN } from "$lib/utils/CommonVariables"
    import { checkMobile } from "$lib/utils/Mobile"

    let loading = false
    let contentAsideOpen = false
    let clipboardWrite = false

    const checkClipboardPermission = async () => {
        try {
            let items = await navigator.clipboard.read()
            await navigator.clipboard.write(items)
            clipboardWrite = true
        } catch (err) {
            clipboardWrite = false
        }
    }
    onMount(async () => {
        await checkClipboardPermission()
    })

    $: sidebarOpen = UIStore.state.sidebarOpen
    $: activeChat = Store.state.activeChat
    $: isFavorite = derived(Store.state.favorites, favs => favs.some(f => f.id === $activeChat.id))
    $: conversation = ConversationStore.getConversation($activeChat)
    $: users = Store.getUsersLookup($activeChat.users)

    // TODO(Lucas): Need to improve that for chats when not necessary all users are friends
    $: loading = get(UIStore.state.chats).length > 0 && !$activeChat.users.slice(1).some(userId => $users[userId]?.name !== undefined)

    $: chatName = $activeChat.kind === ChatType.DirectMessage ? $users[$activeChat.users[1]]?.name : ($activeChat.name ?? $users[$activeChat.users[1]]?.name)
    $: statusMessage = $activeChat.kind === ChatType.DirectMessage ? $users[$activeChat.users[1]]?.profile?.status_message : $activeChat.motd
    $: pinned = getPinned($conversation)

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    let transact: boolean = false
    let previewImage: string | null
    let previewProfile: User | null
    let newGroup: boolean = false
    let showUsers: boolean = false
    let showMarket: boolean = false
    let withPinned: string | undefined = undefined
    let groupSettings: boolean = false
    let unasavedChangesOnGroupSettings: boolean = false
    let search_filter: string
    let search_component: ChatFilter
    let dragging_files = 0
    let editing_message: string | undefined = undefined
    let editing_text: string | undefined = undefined
    $: emojis = UIStore.getMostUsed()
    $: own_user = Store.state.user
    let replyTo: MessageType | undefined = undefined
    let reactingTo: string | undefined
    let fileUpload: FileInput
    let files: [File?, string?][] = []
    let browseFiles: boolean = false

    $: chats = UIStore.state.chats
    $: pendingMessages = derived(ConversationStore.getPendingMessages($activeChat), msg => Object.values(msg))

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

    function build_context_items(message: MessageType, file?: Attachment) {
        return [
            message.pinned
                ? {
                      id: "unpin-message",
                      icon: Shape.HeartSlash,
                      text: $_("messages.unpin"),
                      appearance: Appearance.Default,
                      onClick: async () => {
                          await pin_message(message.id, false)
                      },
                  }
                : {
                      id: "pin-message",
                      icon: Shape.Heart,
                      text: $_("messages.pin"),
                      appearance: Appearance.Default,
                      onClick: async () => {
                          await pin_message(message.id, true)
                      },
                  },
            {
                id: "reply",
                icon: Shape.ArrowLeft,
                text: $_("messages.reply"),
                appearance: Appearance.Default,
                onClick: () => {
                    replyTo = message
                },
            },
            {
                id: "copy",
                icon: Shape.Clipboard,
                text: $_("generic.copy"),
                appearance: Appearance.Default,
                onClick: () => {
                    copy(message.text.join("\n"))
                },
            },
            ...(file && clipboardWrite
                ? [
                      {
                          id: "copy-file",
                          icon: Shape.Clipboard,
                          text: $_("generic.copy.file"),
                          appearance: Appearance.Default,
                          onClick: () => {
                              copyFile(message.id, file)
                          },
                      },
                  ]
                : []),
            ...(message.details.origin === $own_user.key
                ? [
                      ...(!message.text.some(text => text.includes("giphy.com")) &&
                      !message.text.some(text => text.includes(tempCDN)) &&
                      !message.text.some(text => text.includes(get(_)("settings.calling.callMissed"))) &&
                      !message.text.some(text => text.includes(get(_)("settings.calling.endCallMessage"))) &&
                      !message.text.some(text => text.includes(get(_)("settings.calling.startCallMessage")))
                          ? [
                                {
                                    id: "edit",
                                    icon: Shape.Pencil,
                                    text: $_("messages.edit"),
                                    appearance: Appearance.Default,
                                    onClick: () => {
                                        editing_message = message.id
                                        editing_text = message.text.join("\n")
                                    },
                                },
                            ]
                          : []),
                      ...(!message.text.some(text => text.includes(get(_)("settings.calling.callMissed"))) &&
                      !message.text.some(text => text.includes(get(_)("settings.calling.endCallMessage"))) &&
                      !message.text.some(text => text.includes(get(_)("settings.calling.startCallMessage")))
                          ? [
                                {
                                    id: "delete",
                                    icon: Shape.Trash,
                                    text: $_("generic.delete"),
                                    appearance: Appearance.Default,
                                    onClick: async () => {
                                        await delete_message(message.id)
                                    },
                                },
                            ]
                          : []),
                  ]
                : []),
        ]
    }

    async function edit_message(message: string, text: string) {
        editing_message = undefined
        editing_text = undefined
        await RaygunStoreInstance.edit($conversation!.id, message, text.split("\n"))
    }

    async function delete_message(message: string) {
        await RaygunStoreInstance.delete($conversation!.id, message)
    }

    async function reactTo(message: string, emoji: string, toggle: boolean) {
        let add = toggle ? !ConversationStore.hasReaction($activeChat, message, emoji) : true
        if (add) UIStore.useEmoji(emoji)
        await RaygunStoreInstance.react($conversation!.id, message, add ? 0 : 1, emoji)
    }

    async function pin_message(message: string, pin: boolean) {
        await RaygunStoreInstance.pin($conversation!.id, message, pin)
    }

    async function copy(txt: string) {
        await navigator.clipboard.writeText(txt)
    }

    async function copyFile(message: string, attachment: Attachment) {
        if (attachment.kind !== MessageAttachmentKind.Image) return
        let result = await RaygunStoreInstance.getAttachmentRaw($conversation!.id, message, attachment.name, attachment.size)
        result.onSuccess(async blob => {
            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blob,
                }),
            ])
        })
    }

    async function download_attachment(message: string, attachment: Attachment) {
        await RaygunStoreInstance.downloadAttachment($conversation!.id, message, attachment.name, attachment.size)
    }
    let activeCallInProgress = false
    let activeCallDid = ""

    Store.state.activeCall.subscribe(call => {
        if (call) {
            activeCallInProgress = true
            activeCallDid = call.chat.id
        } else {
            activeCallInProgress = false
        }
    })

    let typing = debounce(async () => {
        await RaygunStoreInstance.sendEvent($activeChat.id, MessageEvent.Typing)
    }, 50)

    onMount(() => {
        setInterval(() => {
            if (VoiceRTCInstance.acceptedIncomingCall || VoiceRTCInstance.makingCall) {
                activeCallInProgress = true
                activeCallDid = VoiceRTCInstance.channel
            } else {
                activeCallInProgress = false
            }
        }, 500)
    })

    function getPinned(conversation: ConversationMessages | undefined): MessageType[] {
        if (!conversation) return []
        return conversation!.messages.flatMap(g => g.messages.filter(m => m.pinned))
    }

    function handleClickOutsideEditInput(event: any) {
        const myElement = document.getElementById(`chat-message-edit-input-${editing_message}`)
        if (myElement && !myElement.contains(event.target)) {
            editing_message = undefined
        }
    }
    document.addEventListener("click", handleClickOutsideEditInput)
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
    {#if transact}
        <Modal
            on:close={_ => {
                transact = false
            }}>
            <CreateTransaction onClose={() => (transact = false)} on:create={_ => (transact = false)} />
        </Modal>
    {/if}

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
            }}
            escape>
            <Profile user={previewProfile} on:close={_ => (previewProfile = null)} />
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
                if (!unasavedChangesOnGroupSettings) {
                    groupSettings = false
                }
            }}>
            <GroupSettings
                activeChat={$activeChat}
                on:create={_ => (groupSettings = false)}
                on:unasavedChanges={value => (unasavedChangesOnGroupSettings = value.detail)}
                on:close={_ => ((groupSettings = false), (unasavedChangesOnGroupSettings = false))} />
        </Modal>
    {/if}

    {#if showUsers}
        <Modal
            on:close={_ => {
                showUsers = false
            }}>
            <ViewMembers adminControls activeChat={$activeChat} members={Object.values($users)} on:create={_ => (showUsers = false)} />
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

    {#if withPinned}
        <Modal
            noBackground={true}
            direct={true}
            on:close={_ => {
                withPinned = undefined
            }}>
            <PinnedMessages chatID={$activeChat.id} messages={pinned} top={withPinned}></PinnedMessages>
        </Modal>
    {/if}

    <!-- Sidebar -->
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={$sidebarOpen} activeRoute={Route.Chat} bind:search={search_filter} on:search={() => search_component.filter_chat()} on:enter={() => search_component.select_first()}>
        <ChatFilter bind:this={search_component} bind:filter={search_filter}></ChatFilter>
        <!--
            <Button hook="button-marketplace" appearance={showMarket ? Appearance.Primary : Appearance.Alt} text={$_("market.market")} on:click={_ => (showMarket = true)}>
                <Icon icon={Shape.Shop} />
            </Button>
        -->
        <div class="content-header">
            <Label hook="label-sidebar-chats" text={$_("chat.chat_plural")} />
            <Button hook="button-create-group-chat" icon small tooltipPosition={TooltipPosition.LEFT} appearance={Appearance.Primary} tooltip={$_("chat.create")} on:click={_ => (newGroup = true)}>
                <Icon icon={Shape.ChatPlus} alt />
            </Button>
        </div>

        {#each $chats.slice().sort((a, b) => {
            const dateA = new Date(a.last_message_at || 0)
            const dateB = new Date(b.last_message_at || 0)
            return dateB.getTime() - dateA.getTime()
        }) as chat}
            <ContextMenu
                hook="context-menu-sidebar-chat"
                items={[
                    {
                        id: "favorite",
                        icon: Shape.Heart,
                        text: $_("chat.favorite"),
                        appearance: Appearance.Default,
                        onClick: () => Store.toggleFavorite(chat),
                    },
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
                <ChatPreview slot="content" let:open on:contextmenu={open} chat={chat} loading={loading} simpleUnreads cta={$activeChat === chat} />
            </ContextMenu>
        {/each}
    </Sidebar>

    <div class="content">
        {#if $activeChat.users.length > 0}
            <Topbar>
                <div slot="before">
                    {#if $activeChat.users.length > 0}
                        {#if $activeChat.kind === ChatType.DirectMessage}
                            <ProfilePicture
                                hook="chat-topbar-profile-picture"
                                typing={$activeChat.typing_indicator.size > 0}
                                id={$users[$activeChat.users[1]]?.key}
                                image={$users[$activeChat.users[1]]?.profile.photo.image}
                                frame={$users[$activeChat.users[1]]?.profile.photo.frame}
                                status={$users[$activeChat.users[1]]?.profile.status}
                                size={Size.Medium}
                                loading={loading} />
                        {:else}
                            <ProfilePictureMany users={Object.values($users)} on:click={_ => (showUsers = true)} />
                        {/if}
                    {/if}
                </div>
                <div slot="content">
                    {#if $activeChat.users.length > 0}
                        <Text hook="chat-topbar-username" class="min-text" singleLine loading={loading}>{chatName}</Text>
                        <Text hook="chat-topbar-status" class="min-text" singleLine muted size={Size.Smaller} loading={loading}>
                            {statusMessage}
                        </Text>
                    {/if}
                </div>
                <svelte:fragment slot="controls">
                    <Button
                        hook="button-chat-call"
                        tooltip={$_("chat.call")}
                        tooltipPosition={TooltipPosition.BOTTOM}
                        loading={loading}
                        icon
                        appearance={Appearance.Alt}
                        disabled={$activeChat.users.length === 0}
                        on:click={async _ => {
                            Store.setActiveCall($activeChat)
                            await VoiceRTCInstance.startToMakeACall($activeChat.users[1], $activeChat.id, true)
                            activeCallInProgress = true
                        }}>
                        <Icon icon={Shape.PhoneCall} />
                    </Button>
                    <Button
                        icon
                        hook="button-chat-video"
                        tooltip={$_("chat.videocall")}
                        tooltipPosition={TooltipPosition.BOTTOM}
                        appearance={Appearance.Alt}
                        disabled={$activeChat.users.length === 0}
                        loading={loading}
                        on:click={async _ => {
                            await VoiceRTCInstance.startToMakeACall($activeChat.users[1], $activeChat.id)
                            activeCallInProgress = true
                            Store.setActiveCall($activeChat)
                        }}>
                        <Icon icon={Shape.VideoCamera} />
                    </Button>
                    <Button
                        icon
                        hook="button-chat-favorite"
                        tooltip={$_("chat.favorite")}
                        tooltipPosition={TooltipPosition.BOTTOM}
                        disabled={$activeChat.users.length === 0}
                        loading={loading}
                        appearance={$isFavorite ? Appearance.Primary : Appearance.Alt}
                        on:click={_ => {
                            Store.toggleFavorite($activeChat)
                        }}>
                        <Icon icon={Shape.Heart} alt={$isFavorite} />
                    </Button>
                    <Button
                        hook="button-chat-pin"
                        tooltip={$_("chat.pinned-messages")}
                        tooltipPosition={TooltipPosition.BOTTOM}
                        icon
                        disabled={$activeChat.users.length === 0}
                        loading={loading}
                        appearance={Appearance.Alt}
                        on:click={_ => {
                            let top = document.getElementsByClassName("topbar")[0]
                            let height = top.getBoundingClientRect().height
                            withPinned = `calc(${height}px + var(--padding-minimal))`
                        }}>
                        <Icon icon={Shape.Pin} />
                    </Button>
                    {#if $activeChat.kind === ChatType.Group}
                        <Button
                            hook="button-chat-group-participants"
                            tooltip={$_("chat.show-participants")}
                            tooltipPosition={TooltipPosition.BOTTOM}
                            icon
                            appearance={showUsers ? Appearance.Primary : Appearance.Alt}
                            loading={loading}
                            on:click={_ => {
                                showUsers = true
                            }}>
                            <Icon icon={Shape.Users} alt={showUsers} />
                        </Button>
                        <Button
                            hook="button-chat-group-settings"
                            tooltip={$_("chat.group-settings")}
                            tooltipPosition={TooltipPosition.BOTTOM}
                            icon
                            appearance={groupSettings ? Appearance.Primary : Appearance.Alt}
                            loading={loading}
                            on:click={_ => {
                                groupSettings = true
                            }}>
                            <Icon icon={Shape.Cog} alt={groupSettings} />
                        </Button>
                    {/if}
                    {#if $activeChat.users.length === 1}
                        <Button
                            icon
                            appearance={contentAsideOpen ? Appearance.Primary : Appearance.Alt}
                            loading={loading}
                            on:click={_ => {
                                contentAsideOpen = !contentAsideOpen
                            }}>
                            <Icon icon={Shape.Profile} alt={contentAsideOpen} />
                        </Button>
                    {/if}
                </svelte:fragment>
            </Topbar>
        {/if}
        {#if activeCallInProgress && activeCallDid === $activeChat.id}
            <CallScreen chat={$activeChat} />
        {/if}

        <Conversation loading={loading}>
            {#if $activeChat !== null && $activeChat.users.length > 0}
                <EncryptedNotice />
                {#if conversation}
                    {#each $conversation.messages as group}
                        <StoreResolver value={group.details.origin} resolver={v => Store.getUser(v)} let:resolved>
                            <MessageGroup
                                profilePictureRequirements={{
                                    notifications: 0,
                                    image: resolved.profile.photo.image,
                                    frame: resolved.profile.photo.frame,
                                    status: resolved.profile.status,
                                    highlight: Appearance.Default,
                                    id: resolved.key,
                                }}
                                on:profileClick={_ => {
                                    previewProfile = resolved
                                }}
                                remote={group.details.remote}
                                username={resolved.name}
                                subtext={getTimeAgo(group.messages[0].details.at)}>
                                {#each group.messages as message, idx}
                                    {#if message.inReplyTo}
                                        <StoreResolver value={message.inReplyTo.details.origin} resolver={v => Store.getUser(v)} let:resolved>
                                            <MessageReplyContainer remote={message.inReplyTo.details.remote} image={resolved.profile.photo.image}>
                                                <Message reply remote={message.inReplyTo.details.remote}>
                                                    {#each message.inReplyTo.text as line}
                                                        <Text markdown={line} muted size={Size.Small} />
                                                    {/each}
                                                </Message>
                                            </MessageReplyContainer>
                                        </StoreResolver>
                                    {/if}
                                    {#if message.text.length > 0 || message.attachments.length > 0}
                                        <ContextMenu hook="context-menu-chat-message" items={build_context_items(message)}>
                                            <Message
                                                id={message.id}
                                                pinned={message.pinned}
                                                slot="content"
                                                let:open
                                                on:contextmenu={open}
                                                remote={group.details.remote}
                                                position={idx === 0 ? MessagePosition.First : idx === group.messages.length - 1 ? MessagePosition.Last : MessagePosition.Middle}
                                                morePadding={message.text.length > 1 || message.attachments.length > 0}>
                                                {#if editing_message === message.id}
                                                    <Input hook="chat-message-edit-input-{editing_message}" alt bind:value={editing_text} autoFocus rich on:enter={_ => edit_message(message.id, editing_text ? editing_text : "")} />
                                                {:else}
                                                    {#each message.text as line}
                                                        {#if getValidPaymentRequest(line) != undefined}
                                                            <Button text={getValidPaymentRequest(line)?.toDisplayString()} on:click={async () => getValidPaymentRequest(line)?.execute()}></Button>
                                                        {:else if !line.includes(VoiceRTCMessageType.Calling) && !line.includes(VoiceRTCMessageType.EndingCall) && !line.includes(tempCDN)}
                                                            <Text hook="text-chat-message" markdown={line} appearance={group.details.remote ? Appearance.Default : Appearance.Alt} />
                                                        {:else if line.includes(tempCDN)}
                                                            <div class="sticker">
                                                                <Text hook="text-chat-message" markdown={line} size={Size.Smallest} appearance={group.details.remote ? Appearance.Default : Appearance.Alt} />
                                                            </div>
                                                        {/if}
                                                    {/each}

                                                    {#if message.attachments.length > 0}
                                                        {#each message.attachments as attachment}
                                                            <ContextMenu hook="context-menu-chat-attachment" items={build_context_items(message, attachment)}>
                                                                <div
                                                                    slot="content"
                                                                    let:open
                                                                    on:contextmenu={e => {
                                                                        e.stopPropagation()
                                                                        open(e)
                                                                    }}>
                                                                    {#if attachment.kind === MessageAttachmentKind.File || attachment.location.length == 0}
                                                                        <FileEmbed
                                                                            fileInfo={{
                                                                                id: "1",
                                                                                isRenaming: OperationState.Initial,
                                                                                source: "unknown",
                                                                                name: attachment.name,
                                                                                displayName: attachment.name,
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
                                                                    {:else if attachment.kind === MessageAttachmentKind.Text}
                                                                        <TextDocument />
                                                                    {:else if attachment.kind === MessageAttachmentKind.STL}
                                                                        <STLViewer url={attachment.location} name={attachment.name} filesize={attachment.size} />
                                                                    {:else if attachment.kind === MessageAttachmentKind.Audio}
                                                                        <AudioEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                                                    {:else if attachment.kind === MessageAttachmentKind.Video}
                                                                        <VideoEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                                                    {/if}
                                                                </div>
                                                            </ContextMenu>
                                                        {/each}
                                                    {/if}
                                                {/if}
                                            </Message>
                                            <svelte:fragment slot="items" let:close>
                                                <EmojiGroup emojis={$emojis} emojiPick={emoji => reactTo(message.id, emoji, true)} close={close} on:openPicker={_ => (reactingTo = message.id)}></EmojiGroup>
                                            </svelte:fragment>
                                        </ContextMenu>
                                    {/if}
                                    {#if Object.keys(message.reactions).length > 0}
                                        <MessageReactions remote={group.details.remote} reactions={Object.values(message.reactions)} onClick={emoji => reactTo(message.id, emoji, true)} />
                                    {/if}
                                {/each}
                            </MessageGroup>
                        </StoreResolver>
                    {/each}
                    <PendingMessageGroup>
                        {#each $pendingMessages as pending, idx}
                            <PendingMessage
                                message={pending}
                                position={idx === 0 ? MessagePosition.First : idx === $pendingMessages.length - 1 ? MessagePosition.Last : MessagePosition.Middle}
                                on:abort={e => {
                                    if (Object.keys(get(pending.attachmentProgress)).length == 0) {
                                        ConversationStore.removePendingMessages($activeChat.id, e.detail.message)
                                    }
                                }}></PendingMessage>
                        {/each}
                    </PendingMessageGroup>
                {/if}
            {:else}
                <div class="add-someone" data-cy="section-add-someone">
                    <img src="/assets/mascot/better_with_friends.webp" class="better-with-friends" alt="Better with friends!" />
                    <Text>{$_("chat.getStarted")}</Text>
                    <Text muted centered>{$_("chat.noChat")}</Text>
                    <Button hook="button-add-friends" appearance={Appearance.Primary} text="Add Friends" on:click={_ => goto(Route.Friends)}>
                        <Icon icon={Shape.Users} />
                    </Button>
                </div>
            {/if}
        </Conversation>

        {#if files.length > 0}
            <FileUploadPreview
                filesSelected={files}
                on:remove={e => {
                    files = files.filter(([f, p]) => f !== e.detail && p !== e.detail)
                }} />
        {/if}

        {#if $activeChat.users.length > 0}
            <Chatbar
                filesSelected={files}
                replyTo={replyTo}
                activeChat={$activeChat}
                typing={$activeChat.typing_indicator.users && $activeChat.typing_indicator.users().map(u => $users[u])}
                emojiClickHook={emoji => {
                    if (reactingTo) {
                        reactTo(reactingTo, emoji, true)
                        reactingTo = undefined
                        return true
                    }
                    return false
                }}
                on:onsend={_ => (files = [])}
                on:input={_ => {
                    typing()
                }}>
                <svelte:fragment slot="pre-controls">
                    <FileInput bind:this={fileUpload} hidden on:select={e => addFilesToUpload(e.detail)} />
                    <ContextMenu
                        hook="context-menu-chat-add-attachment"
                        items={[
                            {
                                id: "upload",
                                icon: Shape.ArrowUp,
                                text: $_("files.upload"),
                                appearance: Appearance.Default,
                                onClick: () => {
                                    fileUpload.click()
                                },
                            },
                            {
                                id: "from_files",
                                icon: Shape.Eye,
                                text: $_("files.browse"),
                                appearance: Appearance.Default,
                                onClick: () => {},
                            },
                        ]}>
                        <Button hook="button-chat-add-attachment" slot="content" let:open on:click={open} on:contextmenu={open} icon appearance={Appearance.Alt} tooltip={$_("chat.add_attachment")}>
                            <Icon icon={Shape.Plus} />
                        </Button>
                    </ContextMenu>
                </svelte:fragment>

                {#if !checkMobile()}
                    <Controls>
                        <Button
                            hook="button-chat-transact"
                            tooltip={$_("chat.send-coin")}
                            icon
                            outline
                            appearance={transact ? Appearance.Primary : Appearance.Alt}
                            disabled={$activeChat.users.length === 0}
                            loading={loading}
                            on:click={_ => {
                                transact = true
                            }}>
                            <Icon icon={Shape.SendCoin} />
                        </Button>
                    </Controls>
                {/if}
            </Chatbar>
        {/if}
    </div>
    {#if contentAsideOpen}
        <!-- All aside menus should render from this element. Please display only one at a time. -->
        <div class="aside" transition:slide={{ duration: animationDuration, axis: "x" }}>
            <Profile user={$users[$activeChat.users[0]]} />
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

    .sticker {
        width: var(--sticker-width-rendered);
    }
</style>
