<div class="conversation">
    <slot></slot>
</div>

<style lang="scss">
    .conversation {
        min-width: var(--minimum-width);
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: var(--gap-less);
    }
</style>