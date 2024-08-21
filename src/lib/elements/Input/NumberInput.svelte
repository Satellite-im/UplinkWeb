<script lang="ts">
    export let defaultValue: number = 0
</script>

<div class="input-group" role="none">
    <div class="input-container">
        <slot></slot>
        <input class="input" type="number" bind:value={defaultValue} />
    </div>
</div>

<style lang="scss">
    .input-group {
        min-height: var(--input-height);
        height: var(--input-height);
        display: inline-flex;
        flex-direction: row;
        transition: all var(--animation-speed);
        width: 100%;

        .input-container {
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius-minimal);
            background-color: var(--alt-color);
            color: var(--color);
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
            width: fit-content;
            min-height: var(--input-height);
            height: var(--input-height);
            transition: all var(--animation-speed);
            padding: 0 var(--padding);
            flex: 1;
        }

        .input {
            background-color: transparent;
            border: none;
            flex: 1;
            width: 100%;
            color: var(--color);
            cursor: text;

            &:focus {
                outline: none;
                border: none;
            }

            &::placeholder {
                color: var(--placeholder-color);
                opacity: 0.75;
                font-size: var(--label-size);
            }
        }
    }
</style>
