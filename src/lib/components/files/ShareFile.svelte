<script lang="ts">
    import { Appearance, Shape } from "$lib/enums"
    import { Button, Icon } from "$lib/elements"
    import { _ } from "svelte-i18n"
    import type { Attachment } from "$lib/types"
    import { UIStore } from "$lib/state/ui"
    import { ChatPreview } from "$lib/components"
    import Label from "$lib/elements/Label.svelte"
    import Checkbox from "$lib/elements/Checkbox.svelte"
    import { RaygunStoreInstance, type FileAttachment } from "$lib/wasm/RaygunStore"
    import { createEventDispatcher } from "svelte"
    import { log } from "$lib/utils/Logger"

    const CHAT_DIRECTORY = "chat_media"
    type File =
        | {
              type: "attachment"
              chat: string
              attachment: Attachment
          }
        | {
              type: "storage"
              path: string
          }
    export let file: File

    $: chats = UIStore.state.chats

    let selectedChats: string[] = []

    const dispatch = createEventDispatcher()
    function onClose() {
        dispatch("close")
    }

    async function share() {
        if (selectedChats.length === 0) return
        let att: FileAttachment[] = []
        if (file.type === "attachment") {
            att = [
                {
                    file: `/${CHAT_DIRECTORY}/${file.chat}/${file.attachment.name}`,
                },
            ]
        } else {
            att = [
                {
                    file: file.path,
                },
            ]
        }
        log.debug("Sharing file ", att, " with ", selectedChats)
        await RaygunStoreInstance.sendMultiple(selectedChats, [], att)
        onClose()
    }
</script>

<div class="share-files-container">
    <div class="share-files-top">
        <Button hook="share-files" text={$_("files.share.files")} appearance={selectedChats.length === 0 ? Appearance.Alt : Appearance.Default} disabled={selectedChats.length === 0} on:click={share}>
            <Icon icon={Shape.Share} />
        </Button>
    </div>
    <div class="chats-select">
        <Label text={$_("files.share.selectChats")}></Label>
        <div class="chats-select-scroll">
            {#each $chats as chat}
                <button
                    class="chat-select"
                    on:click={_ => {
                        if (!selectedChats.includes(chat.id)) {
                            selectedChats.push(chat.id)
                            selectedChats = selectedChats
                        } else {
                            selectedChats = selectedChats.filter(c => c !== chat.id)
                        }
                    }}>
                    <Checkbox checked={selectedChats.includes(chat.id)}></Checkbox>
                    <ChatPreview chat={chat} loading={false} interactable={false} cta={true} />
                </button>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .share-files-container {
        width: 85vh;
        max-height: 75vh;
        display: flex;
        flex-direction: column;
        .share-files-top {
            display: flex;
            justify-content: end;
            padding: var(--padding-less);
        }
        .chats-select {
            height: 100%;
            display: flex;
            flex-direction: column;
            margin: var(--padding-less);
            padding: var(--padding);
            gap: var(--gap-less);
            background-color: var(--alt-color);
            border-radius: var(--border-radius-less);
            overflow: hidden;
            .chats-select-scroll {
                height: 100%;
                overflow-y: auto;
            }
            .chat-select {
                width: 100%;
                display: flex;
                align-items: center;
                background-color: transparent;
                border-color: transparent;
                gap: var(--gap-less);
                &:hover {
                    background-color: var(--alt-color-alt);
                    cursor: pointer;
                }
                :global(.chat-preview) {
                    width: 100%;
                    background-color: transparent;
                    border-color: transparent;
                }
            }
        }
    }
</style>
