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
    import type { GiphyGif, Message, User } from "$lib/types"
    import { PopupButton } from "$lib/components"
    import CombinedSelector from "$lib/components/messaging/CombinedSelector.svelte"
    import { checkMobile } from "$lib/utils/Mobile"

    export let replyTo: Message | undefined = undefined
    export let filesSelected: [File?, string?][] = []
    export let typing: User[] = []

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

    function formatTyping() {
        if (typing.length > 3) {
            return $_("chat.users-multiple-typing")
        } else if (typing.length == 1) {
            return $_("chat.user-typing", { values: { user: typing[0].name } })
        }
        let users = typing.map(u => u.name).join(", ")
        return $_("chat.user-typing", { values: { users: users } })
    }
</script>

<div class="chatbar" data-cy="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <div class="input-component">
        <Input hook="chatbar-input" alt placeholder={$_("generic.placeholder")} autoFocus bind:value={$message} rounded rich={markdown} on:enter={_ => sendMessage($message)} on:input />
        {#if typing.length > 0}
            <div class="typing-indicator">
                {formatTyping()}
                <div class="dots">
                    <div class="dot dot-1"></div>
                    <div class="dot dot-2"></div>
                    <div class="dot dot-3"></div>
                </div>
            </div>
        {/if}
    </div>
    <slot></slot>

    <PopupButton hook="button-chatbar-emoji-picker" name={$_("chat.emojiPicker")} class="emoji-popup" bind:open={$emojiSelectorOpen}>
        <CombinedSelector active={{ name: $_("chat.emoji"), icon: Shape.Smile }} on:emoji={e => handleEmojiClick(e.detail)} />
        <div slot="icon" class="control">
            <Icon icon={Shape.Smile} />
        </div>
    </PopupButton>

    {#if !checkMobile()}
        <PopupButton hook="button-chatbar-gif-picker" name={$_("chat.gifSearch")} class="emoji-popup" bind:open={$gifSelectorOpen}>
            <CombinedSelector active={{ name: "GIFs", icon: Shape.Gif }} on:gif={e => handleGif(e.detail)} />
            <div slot="icon" class="control">
                <Icon icon={Shape.Gif} />
            </div>
        </PopupButton>

        <PopupButton hook="button-chatbar-sticker-picker" name={$_("chat.stickers")} class="emoji-popup" bind:open={$stickerSelectorOpen}>
            <CombinedSelector active={{ name: $_("chat.stickers"), icon: Shape.Sticker }} on:sticker={e => handleSticker(e.detail)} />
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
        margin-bottom: var(--padding);

        .input-component {
            position: relative;
            width: 100%;
            height: fit-content;
            .typing-indicator {
                font-size: smaller;
                position: absolute;
                display: flex;
                gap: var(--gap-less);
                padding-left: var(--padding);
                .dots {
                    display: flex;
                    gap: var(--gap-less);
                    align-items: center;
                }
                .dot {
                    height: var(--font-size-smaller);
                    width: var(--font-size-smaller);
                    border-radius: 50%;
                    background: var(--color);
                }
                .dot-1 {
                    animation: 1s pulse 0s infinite;
                }
                .dot-2 {
                    animation: 1s pulse 0.33s infinite;
                }
                .dot-3 {
                    animation: 1s pulse 0.66s infinite;
                }
            }
        }

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
                align-self: center;
                justify-self: center;
            }
        }
    }

    @keyframes pulse {
        0% {
            background: var(--color);
        }
        25% {
            background: var(--color);
        }
        75% {
            background: var(--alt-color);
        }
        100% {
            background: var(--color);
        }
    }
</style>
