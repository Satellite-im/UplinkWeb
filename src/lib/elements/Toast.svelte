<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import type { ToastMessage } from "$lib/state/ui/toast"
    import Label from "$lib/elements/Label.svelte"

    export let toast: ToastMessage
    export let remove: () => void
</script>

<div
    class="toast"
    data-cy="toast-notification"
    role="none"
    on:mouseleave
    on:mouseenter
    on:click={_ => {
        if (toast.onclick) {
            toast.onclick()
            remove()
        }
    }}>
    {#if toast.icon}
        <div class="toast-icon">
            <Icon icon={toast.icon} highlight={toast.appearance} />
        </div>
    {/if}
    <div class="toast-content">
        <Label text={toast.title}></Label>
        <p data-cy="toast-notification-text">
            {toast.content}
        </p>
    </div>
    <Button hook="toast-notification-button" small icon appearance={Appearance.Alt} on:click={remove}>
        <Icon icon={Shape.XMark} />
    </Button>
</div>

<style lang="scss">
    .toast {
        position: fixed;
        top: var(--gap);
        right: var(--gap);
        border-radius: var(--border-radius);
        width: var(--sidebar-width);
        min-height: var(--input-height);
        z-index: 1000;
        display: inline-flex;
        flex-direction: row;
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius));
        -webkit-backdrop-filter: blur(var(--blur-radius));
        padding: var(--gap);
        align-items: center;
        gap: var(--gap);
        user-select: none;
        color: var(--color);

        @media only screen and (max-width: 600px) {
            left: 0;
            right: 0;
            margin-left: var(--gap);
            margin-right: var(--gap);
            width: var(--sidebar-width - 20px);
        }

        :global(.label) {
            color: var(--color-bright) !important;
            user-select: none;
            pointer-events: none;
        }

        p {
            font-size: var(--font-size-smaller);
            user-select: none;
            pointer-events: none;
        }

        .toast-icon {
            display: inline-flex;
        }

        .toast-content {
            flex: 1;
        }

        :global(.button) {
            pointer-events: all;
        }
    }
</style>
