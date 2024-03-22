<script lang="ts">
    import Controls from "$lib/layouts/Controls.svelte"
</script>

<div class="topbar">
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

        :global(.before) {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap)
        }

        .content {
            flex:1;
            height: 100%;
            min-width: 0;
            justify-self: flex-start;
        }
    }
</style>