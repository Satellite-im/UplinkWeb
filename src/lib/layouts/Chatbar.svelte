<script lang="ts">
    import { Button, Icon, Input } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { ConversationStore } from "$lib/state/conversation"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import type { Message } from "$lib/types"
    import { PopupButton } from "$lib/components"
    import EmojiSelector from "$lib/components/messaging/emoji/EmojiSelector.svelte"

    initLocale()
    export let replyTo: Message | undefined = undefined
    let markdown = get(SettingsStore.state).messaging.markdownSupport
    let message: string = ""

    async function sendMessage(text: string) {
        let chat = get(Store.state.activeChat)
        let txt = text.split("\n")
        let result = replyTo ? await RaygunStoreInstance.reply(chat.id, replyTo.id, txt) : await RaygunStoreInstance.send(get(Store.state.activeChat).id, text.split("\n"))
        result.onSuccess(res => {
            ConversationStore.addPendingMessages(chat.id, res.message, txt)
        })
        message = ""
        replyTo = undefined
    }
</script>

<div class="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <Input alt placeholder={$_("generic.placeholder")} autoFocus bind:value={message} rounded rich={markdown} on:enter={_ => sendMessage(message)} />

    <slot></slot>

    <PopupButton name="Emoji Pikcer">
        <EmojiSelector />
        <div slot="icon" class="control">
            <Icon icon={Shape.Smile} size={Size.Large} />
        </div>
    </PopupButton>

    <Button icon tooltip={$_("chat.send")} on:click={_ => sendMessage(message)}>
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
    }
</style>
