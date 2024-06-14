<script lang="ts">
    import { MessagePosition } from "$lib/enums"

    export let remote: boolean = false
    export let reply: boolean = false
    export let localSide: boolean = false
    export let morePadding: boolean = false

    export let position: MessagePosition = MessagePosition.Middle
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:contextmenu class="message-bubble {remote ? 'remote' : 'local'} {position} {morePadding ? 'more-padding' : ''} {reply ? 'reply' : ''} {localSide ? 'position-local' : ''}">
    <div class="content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    .message-bubble {
        background-color: var(--primary-color);
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

        &.remote {
            background-color: var(--alt-color);
            border-radius: var(--border-radius-more);
            border-bottom-left-radius: var(--border-radius-minimal);
            align-self: flex-start;
            color: var(--color);
        }

        &.highlight-success {
            border: var(--border-width) solid var(--success-color);
        }

        &.highlight-info {
            border: var(--border-width) solid var(--info-color);
        }

        &.highlight-warning {
            border: var(--border-width) solid var(--warning-color);
        }

        &.highlight-error {
            border: var(--border-width) solid var(--error-color);
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

        &.first.remote,
        &.middle.remote,
        &.last.remote {
            border-radius: var(--border-radius-more);
            border-bottom-left-radius: var(--border-radius-minimal);
        }

        &.middle.remote {
            border-top-left-radius: var(--border-radius-minimal);
        }

        &.last.remote {
            border-top-left-radius: var(--border-radius-minimal);
            border-bottom-left-radius: var(--border-radius-more);
        }

        &.reply {
            font-size: var(--font-size-smaller);
            border-radius: var(--border-radius-more) !important;
            padding: var(--padding-less);

            &.position-local {
                align-self: flex-end;
            }
        }
    }
</style>
