<script lang="ts">
    import { Shape } from "$lib/enums";

    export let icon: Shape = Shape.Beaker;
    export let alt: Boolean = false;

    let clazz = "";
	export { clazz as class };
</script>

<svg class="svg-icon {alt ? "alt" : ""} {clazz || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" >
    { @html icon }
</svg>

<style lang="scss">
    :global(.svg-icon) {
        width: var(--icon-size);
        height: var(--icon-size);
        min-width: var(--icon-size);
        min-height: var(--icon-size);

        &.alt {
            color: var(--color);
        }
    }
</style>
  