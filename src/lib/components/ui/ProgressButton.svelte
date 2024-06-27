<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"

    export let icon: Shape = Shape.Beaker
    export let appearance: Appearance = Appearance.Default
</script>

<div class="progress-button">
    <Button hook="progress-button" icon appearance={appearance}>
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
        position: relative;
        padding: unset;

        .svg {
            pointer-events: none;
            position: absolute;
            left: calc((var(--border-width-more) / 2) * -1);
            top: calc((var(--border-width-more) / 2) * -1);

            circle {
                stroke-dashoffset: 0;
                transition: stroke-dashoffset var(--animation-speed) linear;
                stroke: var(--alt-color-alt);
                stroke-width: var(--border-width-more);
            }

            .bar {
                stroke: var(--color);
                stroke-dashoffset: 70%;
            }
        }
    }
</style>
