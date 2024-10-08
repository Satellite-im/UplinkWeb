<script lang="ts">
    import Text from "$lib/elements/Text.svelte"
    import { ProfilePicture } from "$lib/components"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { type Message } from "$lib/types"
    import { _ } from "svelte-i18n"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { Store } from "$lib/state/Store"
    import StoreResolver from "$lib/components/utils/StoreResolver.svelte"
    import Label from "$lib/elements/Label.svelte"
    import Button from "$lib/elements/Button.svelte"
    import { Icon } from "$lib/elements"
    import AttachmentRenderer from "./AttachmentRenderer.svelte"

    export let chatID: string
    export let messages: Message[]
    export let top: number | string = "var(--padding)"

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
                                    <ProfilePicture hook="pinned-message-profile-picture" size={Size.Small} image={resolved.profile.photo.image} status={resolved.profile.status} highlight={Appearance.Default} notifications={0} />
                                    <div class="pinned-sender">
                                        <Text singleLine hook="pinned-message-sender">{resolved.name}</Text>
                                        <Text muted singleLine hook="pinned-message-timestamp" class="sender-time">{message.details.at.toLocaleString()}</Text>
                                    </div>
                                </StoreResolver>
                                <div class="pinned-button-container">
                                    <Button icon hook="pinned-message-button-unpin" tooltip={$_("messages.pinnedUnpin")} appearance={Appearance.Alt} class="pinned-buttons" on:click={_ => unpin(message.id)}
                                        ><Icon icon={Shape.PinSlash} /></Button>
                                    <Button icon hook="pinned-message-button-go-to" tooltip={$_("messages.pinnedGoto")} class="pinned-buttons" on:click={_ => scrollTo(message.id)}><Icon icon={Shape.GoTo} /></Button>
                                </div>
                            </div>
                        </div>
                        <div class="pinned-message-content">
                            {#each message.text as line}
                                <Text hook="pinned-message-text" markdown={line} />
                            {/each}
                            {#if message.attachments.length > 0}
                                <AttachmentRenderer attachments={message.attachments} messageId={message.id} chatID={chatID}></AttachmentRenderer>
                            {/if}
                        </div>
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
            z-index: 5;
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
            .pinned-sender {
                padding-left: var(--padding);
                display: flex;
                width: 100%;
                flex-direction: column;
                flex: 1;
            }
        }
        .pinned-button-container {
            display: flex;
            height: 100%;
            gap: var(--gap-less);
        }
    }
    .pinned-message-content {
        background-color: var(--alt-color-alt);
        border-radius: 1rem;
        padding: var(--padding-less);
        text-align: center;
        font-size: 0.8rem;
        transform: scale(0.85);
    }
    :global(.pinned-message-content .container .image) {
        transform: scale(0.9) !important;
    }
    :global(.pinned-message-content .container) {
        background-color: var(--alt-color-alt);
    }
</style>
