<script lang="ts">
    export let character: string = "A"
</script>

<div data-cy="key-button" class="key">
    <span data-cy="key-button-text">
        {character}
    </span>
</div>

<style lang="scss">
    div.key {
        min-width: var(--input-height);
        height: var(--input-height);
        text-transform: uppercase;

        > span {
            background-color: var(--alt-color);
            user-select: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: var(--input-height);
            padding: 0 var(--padding);
            height: calc(var(--input-height) - 4px);
            border: var(--border-width) solid var(--color);
            border-radius: var(--border-radius-minimal);
            font-size: var(--label-size);
            color: var(--color);
            box-shadow:
                0px 4px 0px -2px var(--alt-color-alt),
                0px 3px 0px 0px var(--color);
        }
    }
</style>
