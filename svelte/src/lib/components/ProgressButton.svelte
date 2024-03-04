<script lang="ts">
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Shape } from "$lib/enums";

    export let icon: Shape = Shape.Beaker;
    export let percent: number = 0;
    export let appearance: Appearance = Appearance.Default;
</script>

<div class="progress-button">
    <Button icon appearance={appearance}>
        <Icon icon={icon} />
    </Button>
    <!-- TODO: Convert percent to stroke-dasharray value to properly display 0-100% -->
    <svg class="svg primary" width="48" height="48" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle r="21.6" cx="24" cy="24" fill="transparent" stroke-dasharray="135.72" stroke-dashoffset="0"></circle>
        <circle class="bar" r="21.6" cx="24" cy="24" fill="transparent" stroke-dasharray="135.72" stroke-dashoffset="12"></circle>
    </svg>
</div>

<style lang="scss">
    .progress-button {
        font-family: "Secondary";
        position: relative;
        margin: var(--border-width-more);
        width: var(--input-height);
        height: var(--input-height);
        padding: unset;

        .svg {
            pointer-events: none;
            position: absolute;
            left: calc(var(--border-width-more) * -1 - var(--border-width));
            top: calc(var(--border-width-more) * -1 - var(--border-width));

            circle {
                stroke-dashoffset: 0;
                transition: stroke-dashoffset var(--animation-speed) linear;
                stroke: var(--alt-color-alt);
                stroke-width: var(--border-width-more);
            }

            .bar {
                stroke: var(--color);
                stroke-dashoffset: 70%;

                &.info {
                    stroke: var(--info-color);
                }

                &.primary {
                    stroke: var(--primary-color);
                }

                &.alt {
                    stroke: var(--alt-color);
                }

                &.warning {
                    stroke: var(--warning-color);
                }

                &.error {
                    stroke: var(--error-color);
                }
            }
        }
    }
</style>