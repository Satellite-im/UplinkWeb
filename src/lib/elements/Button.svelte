<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { Appearance } from "../enums/index"
    import Loader from './Loader.svelte'
    import Text from './Text.svelte'

    export let tooltip: string | null = ""
    export let disabled: boolean = false
    export let rotateOnHover: boolean = false
    export let text: string = ""
    export let outline: boolean = false
    export let icon: boolean = false
    export let appearance: Appearance = Appearance.Default
    export let loading: boolean = false
    export let small: boolean = false
    export let fill: boolean = false

    // Allow parent to override / add classes
    let clazz = ""
	export { clazz as class }

    // Create an event dispatcher
    const dispatch = createEventDispatcher()

    // Function to dispatch a 'click' event
    function onClick(event: MouseEvent) {
        dispatch('click', event)
    }
</script>

<button
    class="button {fill ? "fill" : ""} {appearance} {rotateOnHover ? "rotate_on_hover" : "" } {outline ? "outlined" : ""} {icon ? "icon" : ""} {tooltip ? "tooltip" : ""} {small ? "small" : ""} {clazz || ''}"
    data-tooltip={tooltip}
    disabled={disabled || loading}
    on:click={onClick}>
        {#if loading}
            <Loader />
        {:else}
            <slot></slot>
        {/if}
        {#if text.length > 0}
            <Text appearance={appearance} loading={loading}>{text}</Text>
        {/if}
</button>

<style lang="scss">
    .button {
        pointer-events: all;
        min-height: var(--input-height);
        color: var(--color);
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

        &.fill {
            flex: 1;
            width: 100%;
            justify-content: flex-start;
            
        }

        &.icon.rotate_on_hover:hover {
            transform: rotate(90deg);
        }

        &:disabled {
            opacity: var(--disabled-opacity);
            pointer-events: none; 
        }

        // Modifier classes for icon and round buttons
        &.icon, &.round {
            min-width: unset;
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
                display: none;
                content: attr(data-tooltip);
                position: absolute;
                bottom: calc(100% + var(--gap));
                white-space: nowrap;
                width: fit-content;
                padding: var(--padding-minimal) var(--padding-less);
                border-radius: var(--border-radius-minimal);
                border: var(--border-width) solid var(--border-color);
                color: var(--color);
                font-size: var(--font-size-smaller);
                text-align: center;
                opacity: 0;
                pointer-events: none;
                z-index: 2;
                transition: all var(--animation-speed);
                background-color: var(--opaque-color);
                backdrop-filter: blur(var(--blur-radius));
                -webkit-backdrop-filter: blur(var(--blur-radius));

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

            &.icon {
                &:before {
                    display: flex;
                }
            }
        }

        // Style variations for button states and themes
        &.alt, &.success, &.info, &.error, &.warning, &.outlined, &.transparent {
            &.alt {
                background-color: var(--alt-color);
                color: var(--color);

                &:hover {
                    background-color: var(--alt-color-alt);
                }
            }

            @each $type in success, info, error, warning {
                &.#{$type} {
                    border-color: var(--#{$type}-color);
                    background-color: var(--#{$type}-color);
                    color: var(--color-alt);

                    &:hover {
                        background-color: var(--#{$type}-color-alt);
                        :global(.text) {
                            color: var(--color-alt);
                        }
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

                &.alt, &.success, &.info, &.error, &.warning {
                    @each $type in alt, success, info, error, warning {
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

                &:hover {
                    background-color: var(--alt-color-alt);
                    border-color: var(--border-color);
                }
            }
        }

        &.small {
            min-height: calc(var(--input-height) / 1.5);
            max-height: calc(var(--input-height) / 1.5);
            &.icon {
                min-width: calc(var(--input-height) / 1.5);
                max-width: calc(var(--input-height) / 1.5);
                max-height: calc(var(--input-height) / 1.5);
                min-height: calc(var(--input-height) / 1.5);
            }
        }

        // Accessibility support
        &:focus, &:active {
            box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color) inset;
            outline: none;
            border: var(--border-width) solid var(--focus-color);
        }
    }
</style>
  