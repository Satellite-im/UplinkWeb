<script lang="ts">
    import { Button, Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/Store"
    import { get, writable } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { RaygunStoreInstance, type FileAttachment } from "$lib/wasm/RaygunStore"
    import { createEventDispatcher } from "svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import type { Chat, GiphyGif, Message } from "$lib/types"
    import { PopupButton } from "$lib/components"
    import CombinedSelector from "$lib/components/messaging/CombinedSelector.svelte"
    import { checkMobile } from "$lib/utils/Mobile"
    import { UIStore } from "$lib/state/ui"
    import { emojiList } from "$lib/components/messaging/emoji/EmojiList"
    import { tempCDN } from "$lib/utils/CommonVariables"

    export let replyTo: Message | undefined = undefined
    export let filesSelected: [File?, string?][] = []
    export let emojiClickHook: (emoji: string) => boolean
    export let activeChat: Chat

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
        let messages = get(Store.state.chatMessagesToSend)
        chatMessages.update(messages => {
            messages[activeChat.id] = $message
            return messages
        })
        Store.state.chatMessagesToSend = chatMessages
    }

    async function sendMessage(text: string, isStickerOrGif: boolean = false) {
        let attachments: FileAttachment[] = []
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
        let chat = get(Store.state.activeChat)
        let txt = text.split("\n")
        let result = replyTo ? await RaygunStoreInstance.reply(chat.id, replyTo.id, txt) : await RaygunStoreInstance.send(get(Store.state.activeChat).id, text.split("\n"), attachments)

        result.onSuccess(res => {
            ConversationStore.addPendingMessages(chat.id, res.message, txt)
        })
        if (!isStickerOrGif) {
            message.set("")
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
        sendMessage(`![${gif.title}](${gif.images.fixed_height_small.url})`, true)
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
            if (emoji.text && result.includes(emoji.text)) {
                result = result.replaceAll(emoji.text, emoji.glyph)
                isThereEmoji = true
            }
            if (emoji.shortname && result.includes(emoji.shortname)) {
                result = result.replaceAll(emoji.shortname, emoji.glyph)
                isThereEmoji = true
            }
        })

        if (isThereEmoji) {
            message.set(result)
        }
        return result
    }
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
        on:input={_ => replaceEmojis($message)}
        on:enter={_ => sendMessage($message)} />

    <slot></slot>

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

    <Button hook="button-chatbar-send-message" icon tooltip={$_("chat.send")} on:click={_ => sendMessage($message)}>
        <Icon icon={Shape.ChevronRight} />
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

        :global(.emoji-popup) {
            position: absolute;
            right: 1rem;
            bottom: var(--input-height);
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
