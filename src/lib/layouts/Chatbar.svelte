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
    import { createEventDispatcher, type EventDispatcher } from "svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import type { Message } from "$lib/types"
    import { PopupButton } from "$lib/components"
    import EmojiSelector from "$lib/components/messaging/emoji/EmojiSelector.svelte"
    import GifSelector from "$lib/components/messaging/gif/GifSelector.svelte"

    initLocale()
    export let replyTo: Message | undefined = undefined
    export let filesSelected: [File?, string?][] = []

    const dispatch = createEventDispatcher()

    let markdown = get(SettingsStore.state).messaging.markdownSupport
    let message = writable("")
    let emojiSelectorOpen = writable(false)
    let gifPickerOpen = writable(false)

    async function sendMessage(text: string) {
        let attachments: FileAttachment[] = []
        filesSelected.forEach(([file, path]) => {
            if (file) {
                attachments.push({
                    file: file.name,
                    attachment: file.stream(),
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
            ConversationStore.addPendingMessages(chat.id, res.message, txt, attachments)
        })
        message.set("")
        replyTo = undefined
        dispatch("onsend")
    }
</script>

<div class="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <Input alt placeholder={$_("generic.placeholder")} autoFocus bind:value={$message} rounded rich={markdown} on:enter={_ => sendMessage($message)} />

    <slot></slot>

    <PopupButton name="Emoji Picker" class="emoji-popup" bind:open={$emojiSelectorOpen}>
        <EmojiSelector
            on:emoji={e => {
                emojiSelectorOpen.set(false)
                message.update(current => current + e.detail)
            }} />
        <div slot="icon" class="control">
            <Icon icon={Shape.Smile} />
        </div>
    </PopupButton>

    <PopupButton name="GIF Search" class="emoji-popup" bind:open={$gifPickerOpen}>
        <GifSelector
            on:gif={e => {
                gifPickerOpen.set(false)
                // TODO: Send gif
            }} />
        <div slot="icon" class="control">
            <Icon icon={Shape.Gif} />
        </div>
    </PopupButton>

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
