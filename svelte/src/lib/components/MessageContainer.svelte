<div class="message-container">
    <slot></slot>
</div>

<style lang="scss">
    .message-container {
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: var(--gap);
    }
</style>