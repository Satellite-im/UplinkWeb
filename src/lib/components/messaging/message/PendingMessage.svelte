<script lang="ts">
    import { Text } from "$lib/elements"
    import { MessagePosition } from "$lib/enums"
    import { SettingsStore } from "$lib/state"
    import { type FileProgress, type PendingMessage } from "$lib/types"
    import { get } from "svelte/store"
    import PendingFileEmbed from "../embeds/PendingFileEmbed.svelte"

    export let message: PendingMessage
    export let morePadding: boolean = false

    export let position: MessagePosition = MessagePosition.Middle

    const compact: boolean = get(SettingsStore.state).messaging.compact

    function abortFileTransfer(progress: FileProgress) {
        if (progress.cancellation) {
            progress.cancellation?.cancel()
        }
        delete message.attachmentProgress[progress.name]
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:contextmenu class="pending-message {position} {morePadding ? 'more-padding' : ''} {compact ? 'compact' : ''}">
    <div class="content">
        {#each message.message.text as line}
            <Text markdown={line} />
        {/each}
        {#if Object.entries(message.attachmentProgress).length > 0}
            {#each Object.values(message.attachmentProgress) as progress}
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
