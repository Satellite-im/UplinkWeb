<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"

    export let icon: Shape = Shape.Beaker
    export let alt: boolean = false
    export let muted: boolean = false
    export let filled: boolean = false
    export let highlight: Appearance = Appearance.Default
    export let spin: boolean = false
    export let size: Size = Size.Medium

    let clazz = ""
    export { clazz as class }

    export let style = ""
</script>

<svg
    style={style}
    class="svg-icon {muted ? 'muted' : ''} {spin ? 'spin' : ''} {alt ? 'alt' : ''} {filled ? 'filled' : ''} {size} {highlight !== null ? `highlight-${highlight}` : ''} {clazz || ''}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor">
    {@html icon}
</svg>

<style lang="scss">
    :global(.svg-icon) {
        color: var(--color);
        width: var(--icon-size);
        height: var(--icon-size);
        min-width: var(--icon-size);
        min-height: var(--icon-size);

        &.alt {
            color: var(--color-alt);
        }

        &.muted {
            color: var(--color-muted);
        }

        &.small {
            width: calc(var(--icon-size) / 1.5);
            height: calc(var(--icon-size) / 1.5);
            min-width: calc(var(--icon-size) / 1.5);
            min-height: calc(var(--icon-size) / 1.5);
        }

        &.large {
            width: var(--icon-size-large);
            height: var(--icon-size-large);
            min-width: var(--icon-size-large);
            min-height: var(--icon-size-large);
        }

        &.larger {
            width: var(--icon-size-larger);
            height: var(--icon-size-larger);
            min-width: var(--icon-size-larger);
            min-height: var(--icon-size-larger);
        }

        &.largest {
            width: var(--icon-size-largest);
            height: var(--icon-size-largest);
            min-width: var(--icon-size-largest);
            min-height: var(--icon-size-largest);
        }

        &.spin {
            animation-name: spin;
            animation-duration: var(--animation-speed-slow);
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }

        &.highlight-success,
        &.highlight-info,
        &.highlight-error,
        &.highlight-alt,
        &.highlight-warning {
            @each $type in alt, success, info, error, warning {
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
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    }
</style>
