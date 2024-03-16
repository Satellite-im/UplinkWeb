<script lang="ts">
    import { Appearance, Shape } from "$lib/enums";

    export let icon: Shape = Shape.Beaker;
    export let alt: boolean = false;
    export let large: boolean = false;
    export let muted: boolean = false;
    export let filled: boolean = false;
    export let highlight: Appearance = Appearance.Default
    export let spin: boolean = false;

    let clazz = "";
	export { clazz as class };
</script>

<svg class="svg-icon {muted ? "muted" : ""} {spin ? "spin" : ""} {alt ? "alt" : ""} {filled ? "filled" : ""} {large ? "large" : ""} {highlight !== null ? `highlight-${highlight}` : ""} {clazz || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" >
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

        &.muted {
            color: var(--color-muted);
        }

        &.large {
            width: var(--icon-size-large);
            height: var(--icon-size-large);
            min-width: var(--icon-size-large);
            min-height: var(--icon-size-large);
        }

        &.spin {
            animation-name: spin;
            animation-duration: var(--animation-speed-slow);
            animation-iteration-count: infinite;
            animation-timing-function: linear; 
        }

        &.highlight-success, &.highlight-info, &.highlight-error, &.highlight-warning {
            @each $type in success, info, error, warning {
                &.highlight-#{$type} {
                    color: var(--#{$type}-color);

                    &.filled {
                        fill: var(--#{$type}-color);
                    }
                }
            }
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
  