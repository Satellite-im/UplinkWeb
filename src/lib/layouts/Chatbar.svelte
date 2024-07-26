<script lang="ts">
    import { Button, Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/Store"
    import { get, writable } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { RaygunStoreInstance, type FileAttachment } from "$lib/wasm/RaygunStore"
    import { createEventDispatcher } from "svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import type { GiphyGif, Message } from "$lib/types"
    import { PopupButton } from "$lib/components"
    import CombinedSelector from "$lib/components/messaging/CombinedSelector.svelte"
    import { checkMobile } from "$lib/utils/Mobile"
    import { VoiceRTCMessageType } from "$lib/media/Voice"

    initLocale()
    export let replyTo: Message | undefined = undefined
    export let filesSelected: [File?, string?][] = []
    export let calling: string = VoiceRTCMessageType.None

    $: if (calling !== VoiceRTCMessageType.None) {
        console.log("Changing calling state in chatbar")
        sendMessage(calling)
        calling = VoiceRTCMessageType.None
    }

    const dispatch = createEventDispatcher()

    let markdown = get(SettingsStore.state).messaging.markdownSupport
    let message = writable("")
    let emojiSelectorOpen = writable(false)
    let gifSelectorOpen = writable(false)
    let stickerSelectorOpen = writable(false)

    async function sendMessage(text: string) {
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
        message.set("")
        replyTo = undefined
        dispatch("onsend")
    }

    function handleEmojiClick(emoji: string) {
        emojiSelectorOpen.set(false)
    }

    function handleGif(gif: GiphyGif) {
        gifSelectorOpen.set(false)
    }

    function handleSticker(gif: GiphyGif) {
        stickerSelectorOpen.set(false)
    }
</script>

<div class="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <Input alt placeholder={$_("generic.placeholder")} autoFocus bind:value={$message} rounded rich={markdown} on:enter={_ => sendMessage($message)} />

    <slot></slot>

    <PopupButton name="Emoji Picker" class="emoji-popup" bind:open={$emojiSelectorOpen}>
        <CombinedSelector active={{ name: "Emojis", icon: Shape.Smile }} on:emoji={e => handleEmojiClick(e.detail)} />
        <div slot="icon" class="control">
            <Icon icon={Shape.Smile} />
        </div>
    </PopupButton>

    {#if !checkMobile()}
        <PopupButton name="GIF Search" class="emoji-popup" bind:open={$gifSelectorOpen}>
            <CombinedSelector active={{ name: "GIFs", icon: Shape.Gif }} on:gif={e => handleGif(e.detail)} />
            <div slot="icon" class="control">
                <Icon icon={Shape.Gif} />
            </div>
        </PopupButton>

        <PopupButton name="Stickers" class="emoji-popup" bind:open={$stickerSelectorOpen}>
            <CombinedSelector active={{ name: "Stickers", icon: Shape.Sticker }} on:sticker={e => handleSticker(e.detail)} />
            <div slot="icon" class="control">
                <Icon icon={Shape.Sticker} />
            </div>
        </PopupButton>
    {/if}

    <Button icon tooltip={$_("chat.send")} on:click={_ => sendMessage($message)}>
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
