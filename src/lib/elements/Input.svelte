<script lang="ts">
    import { Appearance } from "../enums/index"

    // export let loading: boolean = false;
    export let placeholder: string          = ""
    export let alt: boolean                 = false
    export let rounded: boolean             = false
    export let highlight: Appearance        = Appearance.Default
    export let value: string                = ""
    export let disabled: boolean            = false
    export let tooltip: string | null       = ""
    export let copyOnInteract: boolean      = false
    export let centered: boolean            = false

    if (copyOnInteract) {
        tooltip = "Copy"
        disabled = true
    }

    let clazz = ""
	export { clazz as class }
</script>

<div class="input-group {alt ? "alt" : ""} {highlight !== null ? `highlight-${highlight}` : ""} {tooltip ? "tooltip" : ""} {clazz || ''}" data-tooltip={tooltip}>
    <div class="input-container {rounded ? "rounded" : ""} {clazz || ''}">
        <slot></slot>
        <input
            class="input {centered ? "centered" : ""}"
            type="text"
            disabled={disabled}
            bind:value={value}
            placeholder="{placeholder}" />
    </div>
</div>

<style lang="scss">
    .input-group {
        height: var(--input-height);
        display: inline-flex;
        flex-direction: row;
        transition: all var(--animation-speed);
        width: 100%;

        .input-container {
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius-minimal);
            background-color: var(--color);
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
            width: fit-content;
            height: var(--input-height);
            transition: all var(--animation-speed);
            padding: 0 var(--padding);
            flex: 1;

            &.rounded {
                border-radius: var(--border-radius-more);
            }

        }

        .input {
            background-color: transparent;
            border: none;
            flex: 1;
            width: 100%;
            cursor: text;

            &.centered {
                text-align: center;
            }

            &:focus {
                outline: none;
                border: none;
            }

            &::placeholder {
                color: var(--color-alt);
                opacity: 0.75;
                font-size: var(--label-size);
            }
        }

        &.alt {
            .input-container {
                background-color: var(--alt-color);
            }

            .input {
                color: var(--color);

                &::placeholder {
                    color: var(--color);
                }
            }
        }

        .input-container:focus-within {
            box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
        }

        &.highlight-error .input-container, &.highlight-error .svg-icon {
            border-color: var(--error-color);
            color: var(--error-color);
        }
        
        &.highlight-warning .input-container, &.highlight-warning .svg-icon {
            border-color: var(--warning-color);
            color: var(--warning-color);
        }
        
        &.highlight-info .input-container, &.highlight-info .svg-icon {
            border-color: var(--info-color);
            color: var(--info-color);
        }
        
        &.highlight-success .input-container, &.highlight-success .svg-icon {
            border-color: var(--success-color);
            color: var(--success-color);
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
                display: inline;
            }

            &.icon {
                &:before {
                    display: flex;
                }
            }
        }
    }
</style>