<script lang="ts">
    export let less: boolean = false;
</script>

<div class="spacer {less ? "less" : ""}"></div>

<style lang="scss">
    .spacer {
        height: var(--spacer-size);
        width: var(--spacer-size);
        pointer-events: none;

        &.less {
            height: 1rem;
            width: calc(var(--spacer-size) / 2);
        }
    }
</style>