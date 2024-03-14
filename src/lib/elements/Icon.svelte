<script lang="ts">
    import { Shape } from "$lib/enums";

    export let icon: Shape = Shape.Beaker;
    export let alt: boolean = false;
    export let spin: boolean = false;

    let clazz = "";
	export { clazz as class };
</script>

<svg class="svg-icon {spin ? "spin" : ""} {alt ? "alt" : ""} {clazz || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" >
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

        &.spin {
            animation-name: spin;
            animation-duration: var(--animation-speed-slow);
            animation-iteration-count: infinite;
            animation-timing-function: linear; 
        }

        @keyframes spin {
            from {
                transform:rotate(0deg);
            }
            to {
                transform:rotate(360deg);
            }
        }
    }
</style>
  