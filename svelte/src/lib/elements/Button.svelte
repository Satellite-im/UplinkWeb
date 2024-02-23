<script lang="ts">
    import { Appearance } from "../enums/index";

    export let tooltip: string = "";
    export let text: string = "";
    export let outline: boolean = false;
    export let icon: boolean = false;
    export let appearance: Appearance = Appearance.Default;
</script>

<button 
    class="button {appearance} {outline ? "outlined" : ""} {icon ? "icon" : ""} {tooltip.length > 0 ? "tooltip" : ""}"
    data-tooltip={tooltip}>
        <slot></slot>
        {#if text.length > 0}
            {text}
        {/if}
</button>

<style lang="scss">
    .button {
        height: var(--input-height);
        color: var(--color-alt);
        background-color: var(--primary-color);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--button-border-radius);
        padding: var(--padding-less) var(--padding);
        font-size: var(--font-size-smaller);
        gap: var(--gap);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        transition: background-color var(--animation-speed) var(--animation-style),
                    color var(--animation-speed) var(--animation-style),
                    border-color var(--animation-speed) var(--animation-style),
                    all var(--animation-speed);

        // Nested svg-icon path
        .svg-icon path {
            stroke: var(--color-alt);
        }

        // Modifier classes for icon and round buttons
        &.icon, &.round {
            padding: unset;
            min-width: var(--input-height);
            min-height: var(--input-height);
            max-width: var(--input-height);
            max-height: var(--input-height);

            &.round {
                width: var(--input-height);
            }
        }

        // Styles for button:hover
        &:hover {
            cursor: pointer;
            background-color: var(--primary-color-alt);
        }

        // Tooltip styles
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
                background: var(--tooltip-color);
                color: var(--color);
                font-size: var(--font-size-smaller);
                text-align: center;
                opacity: 0;
                pointer-events: none;
                height: fit-content;
                z-index: 3;
                transition: all var(--animation-speed);
            }

            &.tooltip-right:before {
                bottom: unset;
                top: 50%;
                transform: translateY(-50%);
                left: 100%;
                margin-left: var(--gap);
            }

            &.tooltip-left:before {
                bottom: unset;
                top: 50%;
                transform: translateY(-50%);
                right: 100%;
                margin-right: var(--gap);
            }

            &.tooltip-bottom:before {
                top: calc(100% + var(--gap));
            }

            &:hover:before {
                opacity: 1;
            }
        }

        // Style variations for button states and themes
        &.alt, &.success, &.info, &.error, &.outlined, &.transparent {
            &.alt {
                background-color: var(--alt-color);
                color: var(--color);

                .svg-icon path {
                    stroke: var(--color);
                }

                &:hover {
                    background-color: var(--alt-color-alt);
                }
            }

            @each $type in success, info, error {
                &.#{$type} {
                    background-color: var(--#{$type}-color);
                    color: var(--color-alt);

                    &:hover {
                        background-color: var(--#{$type}-color-alt);
                    }
                }
            }

            &.outlined {
                background-color: transparent;
                border-color: var(--primary-color);
                color: var(--primary-color);

                &:hover {
                    background-color: var(--primary-color-alt);
                    color: var(--color-alt);
                }

                &.alt, &.success, &.info, &.error {
                    @each $type in alt, success, info, error {
                        &.#{$type} {
                            border-color: var(--#{$type}-color);
                            color: var(--#{$type}-color);

                            &:hover {
                                background-color: var(--#{$type}-color-alt);
                                color: var(--color-alt);
                            }
                        }
                    }
                }

                &.alt {
                    color: var(--color) !important;
                }
            }

            &.transparent {
                background-color: transparent;
                border-color: transparent;
                color: var(--color);

                .svg-icon path {
                    stroke: var(--color);
                }

                &:hover {
                    background-color: var(--alt-color-alt);
                    border-color: var(--border-color);
                }
            }
        }

        // Accessibility support
        &:focus, &:active {
            box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
            outline: none;
            border: var(--border-width) solid var(--focus-color);
        }
    }
</style>
  