<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
    import { Shape, type SelectOption } from "$lib/enums";

    export let options: Array<SelectOption> = [];
</script>

<div class="select-group">
    <select name="generic-select" class="select">
        {#each options as option}
            <option value={option.value}>{option.text}</option>
        {/each}
    </select>
    <Icon icon={Shape.ChevronDown} />
</div>

<style lang="scss">
    .select-group {
        height: var(--input-height);
        color: var(--color);
        background-color: var(--alt-color);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--button-border-radius);
        padding: 0 var(--padding);
        font-size: var(--font-size-smaller);
        display: inline-flex;
        align-items: center;
        outline: none;
        cursor: pointer;
        pointer-events: none;
        gap: var(--gap);

        .select {
            pointer-events: all;
            appearance: none;
            height: var(--input-height);
            color: var(--color);
            background-color: transparent;
            margin-right: calc((var(--icon-size) + var(--gap)) * -1);
            border: none;
            padding: 0 var(--padding);
            padding-right: calc(var(--padding) + var(--gap));
            font-size: var(--font-size-smaller);
            gap: var(--gap);
            display: inline-flex;
            outline: none;
            cursor: pointer;
            margin-left: calc(var(--padding) * -1);

            &::after {
                content: "";
                width: 0.8em;
                height: 0.5em;
                background-color: var(--color);
                clip-path: polygon(100% 0%, 0 0%, 50% 100%);
            }
        }

        &:focus-within {
            box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
            outline: none;
            border: var(--border-width) solid var(--focus-color);
        }

        &.highlight-success {
            border: var(--border-width) solid var(--success-color);
        }

        &.highlight-info {
            border: var(--border-width) solid var(--info-color);
        }

        &.highlight-error {
            border: var(--border-width) solid var(--error-color);
        }

        &.highlight-warning {
            border: var(--border-width) solid var(--warning-color);
        }
    }
</style>