<script lang="ts">
    export let remote: boolean = false;
</script>

<div class="message-group {remote ? "remote" : "local"}">
    <slot></slot>
</div>

<style lang="scss">
    .message-group {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--gap);
        width: 100%;

        &.remote {
            align-items: flex-start;
        }
    }
</style>