<script lang="ts">
    import { Appearance } from "../enums/index";

    export let placeholder: string = "";
    export let alt: boolean = false;
    export let highlight: Appearance = Appearance.Default;
    let clazz = "";
	export { clazz as class };
</script>

<div class="input-group  {alt ? "alt" : ""} {highlight !== null ? `highlight-${highlight}` : ""} {clazz || ''}">
    <div class="input-container {clazz || ''}">
        <slot></slot>
        <input
            class="input"
            type="text"
            placeholder="{placeholder}" />
    </div>
</div>

<style lang="scss">
    .input-group {
        height: var(--input-height);
        display: inline-flex;
        flex-direction: row;
        transition: all var(--animation-speed);
        width: fit-content;

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
        }

        .input {
            background-color: transparent;
            border: none;
            flex: 1;
            width: 100%;

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
    }
</style>