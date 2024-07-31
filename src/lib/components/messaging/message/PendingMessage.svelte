<script lang="ts">
    import { Text } from "$lib/elements"
    import { MessagePosition } from "$lib/enums"
    import { SettingsStore } from "$lib/state"
    import { type FileProgress, type PendingMessage } from "$lib/types"
    import { get } from "svelte/store"
    import PendingFileEmbed from "../embeds/PendingFileEmbed.svelte"
    import { createEventDispatcher } from "svelte"

    export let message: PendingMessage
    export let morePadding: boolean = false

    export let position: MessagePosition = MessagePosition.Middle

    let attachments = get(message.attachmentProgress) ? Object.values(get(message.attachmentProgress)) : []
    message.attachmentProgress.subscribe(progresses => {
        attachments = Object.values(progresses)
    })

    const compact: boolean = get(SettingsStore.state).messaging.compact

    const dispatcher = createEventDispatcher()
    function abortFileTransfer(progress: FileProgress) {
        if (progress.cancellation) {
            progress.cancellation?.cancel()
        }
        let progresses = get(message.attachmentProgress)
        delete progresses[progress.name]
        message.attachmentProgress.set(progresses)
        dispatcher("abort", { message: message.message.id, file: progress.name })
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:contextmenu data-cy="pending-message" class="pending-message {position} {morePadding ? 'more-padding' : ''} {compact ? 'compact' : ''}">
    <div class="content">
        {#each message.message.text as line}
            <Text hook="pending-message-text" markdown={line} />
        {/each}
        {#if attachments.length > 0}
            {#each attachments as progress}
                <PendingFileEmbed fileInfo={progress} onCancel={() => abortFileTransfer(progress)} />
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">
    .pending-message {
        background-color: var(--alt-color);
        padding: var(--padding-less) var(--padding);
        border-radius: var(--border-radius-more);
        border-bottom-right-radius: var(--border-radius-minimal);
        width: fit-content;
        align-self: flex-end;
        align-items: center;
        justify-content: center;
        display: inline-flex;
        gap: var(--gap);
        color: var(--color);

        .content {
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
            gap: var(--gap-less);
            cursor: default;
            max-width: var(--max-component-width);
        }

        &.more-padding {
            padding: var(--padding);
        }

        &.first {
            border-radius: var(--border-radius-more);
            border-bottom-right-radius: var(--border-radius-minimal);
        }

        &.middle {
            border-radius: var(--border-radius-more);
            border-top-right-radius: var(--border-radius-minimal);
            border-bottom-right-radius: var(--border-radius-minimal);
        }

        &.last {
            border-radius: var(--border-radius-more);
            border-top-right-radius: var(--border-radius-minimal);
        }

        &.compact {
            padding: 0;
            background-color: transparent;

            &.reply {
                padding: 0;
            }
        }
    }
</style>
