<script lang="ts">
    import Text from "$lib/elements/Text.svelte"
    import { FileEmbed, ImageEmbed, STLViewer, ProfilePicture } from "$lib/components"
    import { Appearance, MessageAttachmentKind, Shape, Size } from "$lib/enums"

    import { OperationState, type Attachment, type Message } from "$lib/types"
    import { _ } from "svelte-i18n"
    import TextDocument from "$lib/components/messaging/embeds/TextDocument.svelte"
    import AudioEmbed from "$lib/components/messaging/embeds/AudioEmbed.svelte"
    import VideoEmbed from "$lib/components/messaging/embeds/VideoEmbed.svelte"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { Store } from "$lib/state/Store"
    import StoreResolver from "$lib/components/utils/StoreResolver.svelte"
    import Label from "$lib/elements/Label.svelte"
    import Button from "$lib/elements/Button.svelte"

    export let chatID: string
    export let messages: Message[]
    export let top: number | string = "var(--padding)"

    async function download_attachment(message: string, attachment: Attachment) {
        await RaygunStoreInstance.downloadAttachment(chatID, message, attachment.name, attachment.size)
    }

    async function unpin(message: string) {
        await RaygunStoreInstance.pin(chatID, message, false)
    }

    function scrollTo(message: string) {
        let element = document.getElementById(`message-${message}`)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }
</script>

<div class="pinned-messages-container" data-cy="pinned-messages-container" style="top:{top}">
    <Label hook="label-pinned-messages" text={"Pinned Messages"}></Label>
    {#if messages.length === 0}
        <div data-cy="pinned-messages-empty" class="pinned-empty">{$_("messages.pinnedNone")}</div>
    {:else}
        <div class="pinned-messages">
            {#each messages as message}
                <div class="pinned-message-wrap">
                    <div class="pinned-message" data-cy="pinned-message">
                        <div class="pinned-content-container">
                            <div class="pinned-sender-container">
                                <StoreResolver value={message.details.origin} resolver={v => Store.getUser(v)} let:resolved>
                                    <ProfilePicture hook="pinned-message-profile-picture" size={Size.Smaller} image={resolved.profile.photo.image} status={resolved.profile.status} highlight={Appearance.Default} notifications={0} />
                                    <div class="pinned-sender">
                                        <p data-cy="pinned-message-sender">{resolved.name}</p>
                                        <p data-cy="pinned-message-timestamp" class="sender-time">{message.details.at.toLocaleString()}</p>
                                    </div>
                                </StoreResolver>
                                <div class="pinned-button-container">
                                    <Button small hook="pinned-message-button-go-to" class="pinned-buttons" text={$_("messages.pinnedGoto")} on:click={_ => scrollTo(message.id)}></Button>
                                    <Button small hook="pinned-message-button-unpin" class="pinned-buttons" text={$_("messages.pinnedUnpin")} on:click={_ => unpin(message.id)}></Button>
                                </div>
                            </div>
                            {#each message.text as line}
                                <Text hook="pinned-message-text" markdown={line} />
                            {/each}
                        </div>
                        {#if message.attachments.length > 0}
                            {#each message.attachments as attachment}
                                {#if attachment.kind === MessageAttachmentKind.File || attachment.location.length == 0}
                                    <FileEmbed
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
                                        on:download={_ => download_attachment(message.id, attachment)} />
                                {:else if attachment.kind === MessageAttachmentKind.Image}
                                    <ImageEmbed source={attachment.location} name={attachment.name} filesize={attachment.size} on:download={_ => download_attachment(message.id, attachment)} />
                                {:else if attachment.kind === MessageAttachmentKind.Text}
                                    <TextDocument />
                                {:else if attachment.kind === MessageAttachmentKind.STL}
                                    <STLViewer url={attachment.location} name={attachment.name} filesize={attachment.size} />
                                {:else if attachment.kind === MessageAttachmentKind.Audio}
                                    <AudioEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                {:else if attachment.kind === MessageAttachmentKind.Video}
                                    <VideoEmbed location={attachment.location} name={attachment.name} size={attachment.size} />
                                {/if}
                            {/each}
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .pinned-messages-container {
        position: fixed;
        right: var(--padding);
        display: flex;
        flex-direction: column;
        background: var(--alt-color);
        padding: var(--padding);
        border-radius: var(--border-radius);
        gap: var(--gap-more);
        z-index: 1000;
        .pinned-messages {
            display: flex;
            flex-direction: column;
            gap: var(--gap-more);
            max-width: 600px;
            max-height: 500px;
            overflow: hidden;
            overflow-y: auto;
        }
    }

    .pinned-message-wrap {
        background: var(--background-alt);
        padding: var(--padding-less);
        border-radius: var(--border-radius);
        width: 100%;
        .pinned-sender-container {
            display: flex;
            width: 100%;
            // margin-bottom: var(--padding-less);
            .pinned-sender {
                padding-left: var(--padding);
                display: flex;
                width: 100%;
                flex-direction: column;
                // width: min-content;
                .sender-time {
                    color: var(--color-muted);
                    font-size: small;
                }
            }
        }
    }
    // .pinned-button-container {
    //     display: inline-flex;
    //     min-width: fit-content;
    //     height: fit-content;
    //     gap: var(--gap-less);
    // }
    @media only screen and (max-width: 600px) {
        .pinned-button-container {
            display: grid;
            // margin: var(--gap-less);
        }
        .button {
            height: 100%;
            // gap: var(--gap-less);
        }
    }
</style>
