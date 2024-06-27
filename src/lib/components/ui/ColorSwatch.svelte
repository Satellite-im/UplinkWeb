<script lang="ts">
    import { UIStore } from "$lib/state/ui"

    export let color: string = ""
    export let name: string = ""
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    data-cy="color-swatch"
    class="color-swatch tooltip"
    data-tooltip={name}
    on:click={() => {
        UIStore.setThemeColor(color)
    }}
    style="background-color: {color}">
</div>

<style lang="scss">
    .color-swatch {
        height: var(--swatch-size);
        width: var(--swatch-size);
        border-radius: calc(var(--swatch-size) / 2);
        background-color: attr(data-color);
        display: inline-flex;
        justify-content: center;
        align-items: center;

        &.tooltip {
            position: relative;

            &:before {
                content: attr(data-tooltip);
                position: absolute;
                bottom: calc(100% + var(--gap));
                white-space: nowrap;
                width: fit-content;
                padding: var(--padding-less);
                border-radius: var(--border-radius-minimal);
                border: var(--border-width) solid var(--border-color);
                background-color: var(--opaque-color);
                backdrop-filter: blur(var(--blur-radius));
                -webkit-backdrop-filter: blur(var(--blur-radius));
                color: var(--color);
                font-size: var(--font-size-smaller);
                text-align: center;
                display: none;
                height: fit-content;
                z-index: 2;
            }

            &:hover:before {
                display: block;
            }
        }
    }
</style>
