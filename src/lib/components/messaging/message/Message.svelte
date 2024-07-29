<script lang="ts">
    import Icon from "$lib/elements/Icon.svelte"
    import { MessagePosition, Shape } from "$lib/enums"
    import { SettingsStore } from "$lib/state"
    import { get } from "svelte/store"

    export let id: string = ""
    export let remote: boolean = false
    export let reply: boolean = false
    export let localSide: boolean = false
    export let morePadding: boolean = false
    export let pinned = false

    export let position: MessagePosition = MessagePosition.Middle

    const compact: boolean = get(SettingsStore.state).messaging.compact
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    on:contextmenu
    id={id !== "" ? `message-${id}` : undefined}
    class="message-bubble {remote ? 'remote' : 'local'} {position} {morePadding ? 'more-padding' : ''} {reply ? 'reply' : ''} {localSide ? 'position-local' : ''} {compact ? 'compact' : ''}">
    {#if pinned}
        <div class="pin-indicator">
            <Icon icon={Shape.Pin} />
        </div>
    {/if}
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
        position: relative;

        .pin-indicator {
            position: absolute;
            right: -6px;
            top: -6px;
            height: 12px;
            width: 12px;
            color: var(--text-color);
        }

        .content {
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
            gap: var(--gap-less);
            cursor: default;
            max-width: var(--max-component-width);
            word-break: break-all;
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

        &.compact {
            padding: 0;
            background-color: transparent;

            &.reply {
                padding: 0;
            }
        }
    }
</style>
