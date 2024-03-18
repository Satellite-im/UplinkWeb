<script>
</script>

<div class="topbar">
    <slot name="before" />
    <div class="content">
        <slot name="content" />
    </div>
    <slot name="controls" />
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

        :global(.controls) {
            min-width: fit-content;
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap-less);
        }
    }
</style>