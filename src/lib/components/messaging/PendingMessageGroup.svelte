<script lang="ts">
    import { get } from "svelte/store"
    import { SettingsStore } from "$lib/state"

    const compact: boolean = get(SettingsStore.state).messaging.compact
</script>

<div data-cy="pending-message-group" class={`pending-message-group ${compact ? "compact" : ""}`}>
    <div class="flex">
        <slot></slot>
    </div>
    <div class="pending-message-buffer"></div>
</div>

<style lang="scss">
    .pending-message-group {
        display: inline-flex;
        flex-direction: row;
        align-items: flex-end;
        gap: var(--gap);
        width: 100%;
        position: relative;
        margin-bottom: calc(var(--padding) * 2);

        .flex {
            flex: 1;
            gap: var(--gap-less);
            display: inline-flex;
            flex-direction: column;
        }
        .pending-message-buffer {
            width: var(--input-height);
        }
    }
</style>
