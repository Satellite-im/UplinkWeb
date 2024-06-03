<script lang="ts">
    export let title = ""
    export let row: Boolean = false
</script>

<div class="container bordered {row ? 'flex-column' : ''}">
    {#if title.length > 0}
        <h2 class="title">{title}</h2>
    {/if}
    <slot></slot>
</div>

<style lang="scss">
    .container {
        display: inline-flex;
        gap: var(--gap);
        position: relative;
        padding: var(--padding);
        border-radius: var(--border-radius);
        flex-wrap: wrap;
        align-content: flex-start;
        flex: 1;
        width: auto;
        width: -moz-available;

        &.bordered {
            border: var(--border-width) solid var(--border-color);
            padding: var(--padding);
            margin-top: calc(var(--label-size) / 2);
        }

        .title {
            color: var(--color-muted);
            position: absolute;
            top: calc(var(--padding) * -1.5);
            left: var(--padding);
            background: var(--background);
            font-size: var(--label-size);
            font-weight: normal;
            padding: 0 6px;
        }
    }
</style>
