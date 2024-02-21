<script lang="ts">
    import { Shape } from "$lib/enums";

    export let icon: Shape = Shape.Beaker;
    export let alt: Boolean = false;
</script>

<svg class="svg-icon {alt ? "alt" : ""}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <svelte:element this={icon} />
</svg>

<style lang="scss">
    .svg-icon {
        width: var(--icon-size);
        height: var(--icon-size);
        min-width: var(--icon-size);
        min-height: var(--icon-size);
        
        path {
            stroke: var(--color);
        }

        &.alt {
            path {
                stroke: var(--color-alt);
            }
        }
    }

</style>
  