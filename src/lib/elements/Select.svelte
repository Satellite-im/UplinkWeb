<script lang="ts">
    import Icon from "$lib/elements/Icon.svelte";
    import { Shape, Appearance } from "$lib/enums";
    import type { SelectOption } from "$lib/types";

    export let options: Array<SelectOption> = [];
    export let highlight: Appearance = Appearance.Default;
    export let alt: boolean = false;

    let selected: string;
</script>

<div class="select-group {highlight !== null ? `highlight-${highlight}` : ""} {alt ? "alt" : ""}">
    <select name="generic-select" class="select" bind:value={selected}>
        {#each options as option}
            <option value={option.value}>{option.text}</option>
        {/each}
    </select>
    <Icon icon={Shape.ChevronDown} />
</div>

<style lang="scss">
    .select-group {
        height: var(--input-height);
        color: var(--color-alt);
        background-color: var(--color);
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
            color: var(--color-alt);
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
        }

        &.alt {
            color: var(--color);
            background-color: var(--alt-color);

            .select {
                color: var(--color);
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