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
    data-cy="message-bubble-{remote ? 'remote' : 'local'}"
    class="message-bubble {remote ? 'remote' : 'local'} {position} {morePadding ? 'more-padding' : ''} {reply ? 'reply' : ''} {localSide ? 'position-local' : ''} {compact ? 'compact' : ''}">
    {#if pinned}
        <div data-cy="message-pin-indicator" class="pin-indicator">
            <Icon icon={Shape.Pin} />
        </div>
    {/if}
    <div data-cy="message-bubble-content" class="content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    .message-bubble {
        background-color: var(--primary-color);
        color: var(--color-alt);
        padding: var(--padding-less) var(--padding);
        border-radius: var(--border-radius-more);
        border-bottom-right-radius: var(--border-radius-minimal);
        width: fit-content;
        align-self: flex-end;
        align-items: center;
        justify-content: center;
        display: inline-flex;
        gap: var(--gap);
        position: relative;

        :global(img) {
            margin: var(--padding-less) 0;
            border-radius: var(--border-radius);
        }

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
            overflow-wrap: break-word;
        }

        &.more-padding {
            padding: var(--padding);
        }

        &.remote {
            background-color: var(--alt-color);
            color: var(--color);
            border-radius: var(--border-radius-more);
            border-bottom-left-radius: var(--border-radius-minimal);
            align-self: flex-start;
            &.reply {
                background-color: color-mix(in srgb, var(--alt-color) 50%, transparent);
            }
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
            background-color: color-mix(in srgb, var(--primary-color) 50%, transparent);

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

        &:has(.sticker) {
            padding: 0;
            background-color: transparent;
        }
    }
</style>
