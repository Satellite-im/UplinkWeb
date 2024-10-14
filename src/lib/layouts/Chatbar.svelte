<script lang="ts">
    import { Button, Icon, Input, Label } from "$lib/elements"
    import { Appearance, MessagePosition, Shape, Size } from "$lib/enums"
    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/Store"
    import { get, writable } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { RaygunStoreInstance, type FileAttachment } from "$lib/wasm/RaygunStore"
    import { createEventDispatcher, onMount } from "svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import type { Chat, FileInfo, GiphyGif, User } from "$lib/types"
    import { Message, PopupButton } from "$lib/components"
    import { type Message as MessageType } from "$lib/types"
    import { ProfilePicture } from "$lib/components"
    import CombinedSelector from "$lib/components/messaging/CombinedSelector.svelte"
    import { checkMobile } from "$lib/utils/Mobile"
    import { UIStore } from "$lib/state/ui"
    import { emojiList, emojiRegexMap } from "$lib/components/messaging/emoji/EmojiList"
    import { tempCDN } from "$lib/utils/CommonVariables"
    import { getValidPaymentRequest } from "$lib/utils/Wallet"
    import { VoiceRTCMessageType } from "$lib/media/Voice"
    import { MessageEvent } from "warp-wasm"
    import Text from "$lib/elements/Text.svelte"
    import StoreResolver from "$lib/components/utils/StoreResolver.svelte"

    export let replyTo: MessageType | undefined = undefined
    export let emojiClickHook: (emoji: string) => boolean
    export let activeChat: Chat
    export const typing: User[] = []

    const dispatch = createEventDispatcher()

    let markdown = get(SettingsStore.state).messaging.markdownSupport
    let message = writable("")
    $: emojiSelectorOpen = UIStore.state.emojiSelector
    let gifSelectorOpen = writable(false)
    let stickerSelectorOpen = writable(false)
    let hackVariableToRefocusChatBar = writable("")

    let chatMessages = Store.state.chatMessagesToSend

    $: if (activeChat) {
        message.set(get(chatMessages)[activeChat.id] || "")
    }

    $: if (message) {
        chatMessages.update(messages => {
            messages[activeChat.id] = $message
            return messages
        })
        Store.state.chatMessagesToSend = chatMessages
    }

    async function updateTypingIndecator() {
        await RaygunStoreInstance.sendEvent(activeChat.id, MessageEvent.Typing)
    }

    async function sendMessage(text: string, isStickerOrGif: boolean = false) {
        message.set("")
        let filesSelected = get(Store.state.chatAttachmentsToSend)[activeChat.id]?.localFiles
        let filesSelectedFromStorage: FileInfo[] = get(Store.state.chatAttachmentsToSend)[activeChat.id]?.storageFiles

        if (text.trim() === "" && filesSelected && filesSelected.length > 0 && filesSelectedFromStorage && filesSelectedFromStorage.length > 0) {
            return
        }

        let attachments: FileAttachment[] = []

        if (filesSelected && filesSelected.length > 0) {
            filesSelected.forEach(([file, path]) => {
                if (file) {
                    attachments.push({
                        file: file.name,
                        attachment: [file.stream(), file.size],
                    })
                } else if (path) {
                    attachments.push({
                        file: path,
                    })
                }
            })
        }

        if (filesSelectedFromStorage && filesSelectedFromStorage.length > 0) {
            filesSelectedFromStorage.forEach(file => {
                attachments.push({
                    file: file.remotePath,
                })
            })
        }

        let chat = get(Store.state.activeChat)
        let txt = text.split("\n")
        let result = replyTo ? await RaygunStoreInstance.reply(chat.id, replyTo.id, txt) : await RaygunStoreInstance.send(get(Store.state.activeChat).id, text.split("\n"), attachments)

        result.onSuccess(res => {
            UIStore.mutateChat(chat.id, c => {
                c.last_view_date = new Date()
            })
            ConversationStore.addPendingMessages(chat.id, res.message, txt)
        })
        if (!isStickerOrGif) {
            chatMessages.update(messages => {
                messages[activeChat.id] = ""
                return messages
            })
        }

        replyTo = undefined
        dispatch("onsend")
    }

    function handleEmojiClick(emoji: string) {
        emojiSelectorOpen.set(false)
        gifSelectorOpen.set(false)
        stickerSelectorOpen.set(false)
        if (emojiClickHook(emoji)) return
        message.update(m => m + emoji)
        hackVariableToRefocusChatBar.set(Math.random().toString())
    }

    function handleGif(gif: GiphyGif) {
        emojiSelectorOpen.set(false)
        gifSelectorOpen.set(false)
        stickerSelectorOpen.set(false)
        sendMessage(`![${gif.title}](${gif.images.original.url})`, true)
        hackVariableToRefocusChatBar.set(Math.random().toString())
    }

    async function handleSticker(sticker: any) {
        emojiSelectorOpen.set(false)
        gifSelectorOpen.set(false)
        stickerSelectorOpen.set(false)
        let stickerUrl = `${tempCDN}${sticker.sticker.path}`
        sendMessage(`![${sticker.sticker.name}](${stickerUrl})`, true)
        hackVariableToRefocusChatBar.set(Math.random().toString())
    }

    function replaceEmojis(inputText: string) {
        let result = inputText

        if (!get(SettingsStore.state).messaging.convertEmoji) {
            return result
        }

        let isThereEmoji = false

        emojiList.smileys_and_emotion.forEach(emoji => {
            let reg = emojiRegexMap.getRegexFor(emoji)
            if (result.match(reg)) {
                result = result.replace(reg, _ => emoji.glyph)
                isThereEmoji = true
            }
        })

        if (isThereEmoji) {
            message.set(result)
        }
        return result
    }

    onMount(() => {
        hackVariableToRefocusChatBar.set(Math.random().toString())
    })
</script>

<div class="chatbar" data-cy="chatbar" id={activeChat.id}>
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>
    <Input
        hook={`${activeChat.id}-${$hackVariableToRefocusChatBar}`}
        alt
        placeholder={$_("generic.placeholder")}
        autoFocus={true}
        bind:value={$message}
        rounded
        rich={markdown}
        on:input={_ => {
            updateTypingIndecator()
            replaceEmojis($message)
        }}
        on:enter={_ => sendMessage($message)} />

    <slot></slot>
    {#if replyTo}
        <div class="chatbar-reply">
            <StoreResolver value={replyTo.details.origin} resolver={v => Store.getUser(v)} let:resolved>
                <Label text={$_("chat.replyTo", { values: { user: resolved.name } })} />
                <div class="reply-message">
                    <Message id={replyTo.id} remote={false} position={MessagePosition.First} morePadding={replyTo.text.length > 1 || replyTo.attachments.length > 0}>
                        {#each replyTo.text as line}
                            {#if getValidPaymentRequest(line) != undefined}
                                <Button text={getValidPaymentRequest(line)?.toDisplayString()} on:click={async () => getValidPaymentRequest(line)?.execute()}></Button>
                            {:else if !line.includes(VoiceRTCMessageType.Calling) && !line.includes(VoiceRTCMessageType.EndingCall) && !line.includes(tempCDN)}
                                <Text hook="text-chat-message" markdown={line} />
                            {:else if line.includes(tempCDN)}
                                <div class="sticker">
                                    <Text hook="text-chat-message" markdown={line} size={Size.Smallest} />
                                </div>
                            {/if}
                        {/each}

                        {#if replyTo.attachments.length > 0}
                            <div class="attachment-container">
                                <Icon icon={Shape.Document} size={Size.Large} />
                                {$_("chat.attachments-count", { values: { amount: replyTo.attachments.length } })}
                            </div>
                        {/if}
                    </Message>
                    <ProfilePicture id={resolved.key} hook="message-group-remote-profile-picture" size={Size.Small} image={resolved.profile.photo.image} status={resolved.profile.status} highlight={Appearance.Default} notifications={0} />
                    <Button appearance={Appearance.Default} icon={true} small={true} on:click={_ => (replyTo = undefined)}>
                        <Icon icon={Shape.XMark} />
                    </Button>
                </div>
            </StoreResolver>
        </div>
    {/if}
    <PopupButton hook="button-chatbar-emoji-picker" name={$_("chat.emojiPicker")} class="emoji-popup" bind:open={$emojiSelectorOpen}>
        <CombinedSelector active={{ name: $_("chat.emoji"), icon: Shape.Smile }} on:emoji={e => handleEmojiClick(e.detail)} on:gif={e => handleGif(e.detail)} on:sticker={e => handleSticker(e.detail)} />
        <div slot="icon" class="control">
            <Icon icon={Shape.Smile} />
        </div>
    </PopupButton>

    {#if !checkMobile()}
        <PopupButton hook="button-chatbar-gif-picker" name={$_("chat.gifSearch")} class="emoji-popup" bind:open={$gifSelectorOpen}>
            <CombinedSelector active={{ name: "GIFs", icon: Shape.Gif }} on:emoji={e => handleEmojiClick(e.detail)} on:gif={e => handleGif(e.detail)} on:sticker={e => handleSticker(e.detail)} />
            <div slot="icon" class="control">
                <Icon icon={Shape.Gif} />
            </div>
        </PopupButton>

        <PopupButton hook="button-chatbar-sticker-picker" name={$_("chat.stickers")} class="emoji-popup" bind:open={$stickerSelectorOpen}>
            <CombinedSelector active={{ name: $_("chat.stickers"), icon: Shape.Sticker }} on:emoji={e => handleEmojiClick(e.detail)} on:gif={e => handleGif(e.detail)} on:sticker={e => handleSticker(e.detail)} />
            <div slot="icon" class="control">
                <Icon icon={Shape.Sticker} />
            </div>
        </PopupButton>
    {/if}

    <Button hook="button-chatbar-send-message" icon appearance={Appearance.Primary} tooltip={$_("chat.send")} on:click={_ => sendMessage($message)}>
        <Icon icon={Shape.ChevronRight} alt />
    </Button>
</div>

<style lang="scss">
    .chatbar {
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        width: 100%;
        border-top: var(--border-width) solid var(--border-color);
        position: relative;

        :global(.emoji-popup) {
            position: absolute;
            right: 1rem;
            bottom: var(--input-height);
        }

        .chatbar-reply {
            display: flex;
            flex-direction: column;
            position: absolute;
            bottom: 100%;
            left: var(--gap);
            right: var(--gap);
            padding: var(--padding-minimal);
            padding-left: var(--padding);
            padding-right: var(--padding);
            background-color: var(--alt-color-alt);
            border-radius: var(--border-radius) var(--border-radius) 0 0;
            max-height: 160px;
            .reply-message {
                display: flex;
                align-items: center;
                gap: var(--gap);
                margin-top: var(--padding-less);
                margin-bottom: var(--padding-less);
                :global(.text) {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    text-align: left;
                }
                :global(img) {
                    max-width: 100%;
                    max-height: 75px;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                }
                .attachment-container {
                    display: flex;
                    align-items: center;
                    background-color: var(--alt-color);
                    padding: var(--padding-minimal);
                    border-radius: var(--border-radius-less);
                }
                .sticker {
                    width: 45px;
                }
            }
            :global(.button) {
                position: absolute;
                top: var(--padding-less);
                right: var(--padding-less);
                z-index: 1;
            }
        }
    }

    @media only screen and (max-width: 600px) {
        .chatbar {
            :global(.emoji-popup) {
                position: absolute;
                right: var(--padding-less);
                left: var(--padding-less);
                bottom: var(--input-height);
                top: var(--padding-less);
                width: 100%;
            }
        }
    }
</style>
