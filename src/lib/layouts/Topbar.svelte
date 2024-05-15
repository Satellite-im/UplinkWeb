<script lang="ts">
    import Controls from "$lib/layouts/Controls.svelte"

    export let simple: boolean = false
</script>

<div class="topbar {simple ? 'simple' : ''}">
    <slot name="before" />
    <div class="content">
        <slot name="content" />
    </div>
    <Controls>
        <slot name="controls" />
    </Controls>
</div>

<style lang="scss">
    .topbar {
        width: 100%;
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        border-bottom: var(--border-width) solid var(--border-color);

        &.simple {
            border: none;
            padding: 0;
        }

        :global(.before) {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
        }

        .content {
            flex: 1;
            height: 100%;
            min-width: 0;
            justify-self: flex-start;
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
        }
    }
</style>
