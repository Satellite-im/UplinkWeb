<script lang="ts">
    import { Icon } from "$lib/elements"
    import { Shape, Appearance } from "$lib/enums"
    import type { SelectOption } from "$lib/types"
    import { createEventDispatcher } from "svelte"

    export let options: Array<SelectOption> = []
    export let highlight: Appearance = Appearance.Default
    export let alt: boolean = false
    export let selected: string = options.length > 0 ? options[0].value : ""
    export let hook: string = ""

    const dispatch = createEventDispatcher()

    function onChange(event: Event) {
        const target = event.target as HTMLSelectElement
        dispatch("change", target.value)
    }
</script>

<div data-cy={hook} class="select-group {highlight !== null ? `highlight-${highlight}` : ''} {alt ? 'alt' : ''}">
    <slot></slot>
    <select name="generic-select" class="select" bind:value={selected} on:change={onChange}>
        {#each options as option}
            <option data-cy="select-option" value={option.value}>{option.text}</option>
        {/each}
    </select>
    <Icon icon={Shape.ChevronDown} />
</div>

<style lang="scss">
    .select-group {
        height: var(--input-height);
        color: var(--color-alt);
        background-color: var(--alt-color-alt);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--button-border-radius);
        padding: 0 var(--padding);
        font-size: var(--font-size-smaller);
        display: inline-flex;
        align-items: center;
        outline: none;
        cursor: pointer;
        pointer-events: none; // This disables all pointer events on the parent element.
        gap: var(--gap);
        width: 100%;

        .select {
            pointer-events: all; // Ensure the select element can receive pointer events.
            appearance: none;
            height: var(--input-height);
            color: var(--color-alt);
            background-color: transparent;
            margin-right: calc(var(--icon-size) * -1);
            margin-left: calc(var(--gap) * -1);
            border: none;
            padding: 0 var(--padding);
            padding-right: calc(var(--icon-size) + var(--gap));
            font-size: var(--font-size-smaller);
            gap: var(--gap);
            display: inline-flex;
            outline: none;
            cursor: pointer;
            width: 100%;
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
