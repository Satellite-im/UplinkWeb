<script>
</script>

<div class="topbar">
    <div class="before">
        <slot name="before" />
    </div>
    <div class="content">
        <slot name="content" />
    </div>
    <div class="controls">
        <slot name="controls" />
    </div>
</div>

<style lang="scss">
    .topbar {
        width: 100%;
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        border-bottom: var(--border-width) solid var(--border-color);

        .content {
            flex:1;
            height: 100%;
            min-width: 40px;
            justify-self: flex-start;
        }

        .controls {
            min-width: fit-content;
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
        }
    }
</style>