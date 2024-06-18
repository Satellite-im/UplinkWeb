<script lang="ts">
    import { Button, Icon, Input } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import Controls from "./Controls.svelte"
    import { Store } from "$lib/state/store"
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"
    import { ConversationStore } from "$lib/state/conversation"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import type { Message } from "$lib/types"

    initLocale()
    export let replyTo: Message | undefined = undefined
    let markdown = get(SettingsStore.state).messaging.markdownSupport
    let message: string = ""

    function sendMessage(text: string) {
        if (replyTo) {
            RaygunStoreInstance.reply(get(Store.state.activeChat).id, replyTo.id, text.split("\n"))
        } else {
            RaygunStoreInstance.send(get(Store.state.activeChat).id, text.split("\n"))
        }
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
