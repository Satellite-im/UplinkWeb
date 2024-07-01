<script lang="ts">
    import { Button, Icon, Input } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/store"
    import { get, writable } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { ConversationStore } from "$lib/state/conversation"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import type { Message } from "$lib/types"
    import { PopupButton } from "$lib/components"
    import EmojiSelector from "$lib/components/messaging/emoji/EmojiSelector.svelte"
    import GifSelector from "$lib/components/messaging/gif/GifSelector.svelte"
    import CombinedSelector from "$lib/components/messaging/CombinedSelector.svelte"
    import { acos } from "three/examples/jsm/nodes/Nodes.js"

    initLocale()
    export let replyTo: Message | undefined = undefined
    let markdown = get(SettingsStore.state).messaging.markdownSupport
    let message = writable("")
    let emojiSelectorOpen = writable(false)
    let gifPickerOpen = writable(false)

    async function sendMessage(text: string) {
        let chat = get(Store.state.activeChat)
        let txt = text.split("\n")
        let result = replyTo ? await RaygunStoreInstance.reply(chat.id, replyTo.id, txt) : await RaygunStoreInstance.send(chat.id, text.split("\n"))
        result.onSuccess(res => {
            ConversationStore.addPendingMessages(chat.id, res.message, txt)
        })
        message.set("")
        replyTo = undefined
    }
</script>

<div class="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <Input alt placeholder={$_("generic.placeholder")} autoFocus bind:value={$message} rounded rich={markdown} on:enter={_ => sendMessage($message)} />

    <slot></slot>

    <PopupButton name="Emoji Picker" class="emoji-popup" bind:open={$emojiSelectorOpen}>
        <CombinedSelector active={"Emoji"} />
        <div slot="icon" class="control">
            <Icon icon={Shape.Smile} />
        </div>
    </PopupButton>

    <PopupButton name="GIF Search" class="emoji-popup" bind:open={$gifPickerOpen}>
        <CombinedSelector active="Gif" />
        <div slot="icon" class="control">
            <Icon icon={Shape.Gif} size={Size.Large} />
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
