<script lang="ts">
    import { createEventDispatcher } from "svelte"

    export let min: number = 0
    export let max: number = 100
    export let value: number = 0

    const dispatch = createEventDispatcher()

    function handleChange(event: any) {
        value = event.target.value
        dispatch("change", value)
    }
</script>

<div class="range-selector" data-cy="range-selector">
    <input data-cy="range-selector-input" type="range" min={min} max={max} value={value} class="range" on:input={handleChange} />
</div>

<style lang="scss">
    .range-selector {
        flex: 1;
        .range {
            -webkit-appearance: none;
            appearance: none;
            background-color: var(--alt-color);
            height: var(--slider-height);
            overflow: hidden;
            border-radius: calc(var(--slider-height) / 1.5);
            border: var(--border-width) solid var(--border-color);
            width: 100%;

            &::-webkit-slider-runnable-track {
                -webkit-appearance: none;
                height: var(--slider-height);
                border: var(--border-width) solid var(--border-color);
            }

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                background: var(--color);
                box-shadow: -1210px 0 0 1200px var(--primary-color);
                cursor: pointer;
                height: calc(var(--slider-height) - var(--border-width));
                width: calc(var(--slider-height) * 1.5);
                border-radius: calc(var(--slider-height) / 1.5);
                border: var(--border-width) solid var(--border-color);
            }

            &::-moz-range-thumb {
                background: var(--color);
                box-shadow: -210px 0 0 200px var(--primary-color);
                cursor: pointer;
                height: var(--slider-height);
                width: calc(var(--slider-height) * 1.5);
                border: 0;
                border-radius: calc(var(--slider-height) / 2);
            }

            &::-moz-range-track {
                background-color: var(--alt-color);
            }

            &::-moz-range-progress {
                background-color: var(--primary-color); // Adjusted to match the intended color
                height: var(--slider-height);
            }

            &::-ms-fill-upper {
                background-color: var(--alt-color);
            }

            &::-ms-fill-lower {
                background-color: var(--alt-color);
            }
        }
    }
</style>
