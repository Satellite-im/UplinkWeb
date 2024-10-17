<script lang="ts">
    import { MessageAttachmentKind, Shape } from "$lib/enums"
    import { ContextMenu, FileEmbed, ImageEmbed, Modal, STLViewer } from "$lib/components"
    import { OperationState, type Attachment, type ContextItem } from "$lib/types"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import TextDocument from "./embeds/TextDocument.svelte"
    import AudioEmbed from "./embeds/AudioEmbed.svelte"
    import VideoEmbed from "./embeds/VideoEmbed.svelte"
    import { createEventDispatcher } from "svelte"
    export let attachments: Attachment[] = []
    export let messageId
    export let chatID: string
    export let contextBuilder: (attachments: Attachment) => ContextItem[]

    async function download_attachment(message: string, attachment: Attachment) {
        await RaygunStoreInstance.downloadAttachment(chatID, message, attachment.name, attachment.size)
    }
    const dispatch = createEventDispatcher()
    const dispatcher = (event: string, detail: string) => {
        dispatch(event, detail)
    }
</script>

{#each attachments as attachment}
    <ContextMenu hook="context-menu-chat-attachment" items={contextBuilder(attachment)}>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            slot="content"
            let:open
            on:contextmenu={e => {
                e.stopPropagation()
                open(e)
            }}>
            {#if attachment.kind === MessageAttachmentKind.File || attachment.location.length == 0}
                <FileEmbed
                    altBackgroundColor={true}
                    fileInfo={{
                        id: "1",
                        isRenaming: OperationState.Initial,
                        source: "unknown",
                        name: attachment.name,
                        size: attachment.size,
                        icon: Shape.Document,
                        displayName: attachment.name,
                        type: "unknown/unknown",
                        remotePath: "",
                    }}
                    on:download={() => download_attachment(messageId, attachment)}
                    on:share={() => {
                        dispatch("share", attachment)
                    }} />
            {:else if attachment.kind === MessageAttachmentKind.Image}
                <ImageEmbed
                    source={attachment.location}
                    name={attachment.name}
                    filesize={attachment.size}
                    on:click={() => {
                        dispatcher("openAttachment", attachment.location)
                    }}
                    on:download={() => download_attachment(messageId, attachment)} />
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
