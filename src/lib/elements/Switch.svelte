<script lang="ts">
    import { createEventDispatcher } from "svelte"

    export let on: boolean = false
    export let small: boolean = false
    export let hook: string = ""

    // Create an event dispatcher
    const dispatch = createEventDispatcher()

    // Function to dispatch a 'click' event
    function onToggle(_: Event) {
        dispatch("toggle", on)
    }
</script>

<label class="switch {small ? 'small' : ''}">
    <input data-cy={hook} type="checkbox" bind:checked={on} on:change={onToggle} />
    <span class="slider"></span>
</label>

<style lang="scss">
    .switch {
        user-select: none;
        cursor: pointer;
        border: none;
        position: relative;
        display: inline-block;
        width: calc(var(--switch-size) * 2);
        height: var(--switch-size);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--switch-size);

        input {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked + .slider {
                background-color: var(--success-color);

                &:before {
                    transform: translateX(var(--switch-size));
                }
            }

            &:focus + .slider {
                // Accessibility support
                box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
            }
        }

        .slider {
            user-select: none;
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--alt-color);
            transition: var(--animation-speed);
            border-radius: var(--switch-size);

            &:before {
                position: absolute;
                content: "";
                height: var(--switch-size);
                width: var(--switch-size);
                left: 0;
                top: calc(var(--border-width) * -1);
                border-radius: var(--switch-size);
                background-color: var(--color);
                transition: var(--animation-speed);
                box-shadow: 0 0 0 var(--shadow-depth) var(--border-color);
            }
        }

        &.small {
            width: calc((var(--switch-size) * 2) / 1.25);
            height: calc(var(--switch-size) / 1.25);

            .slider {
                &:before {
                    top: calc(var(--border-width) * -1);
                    height: calc(var(--switch-size) / 1.25);
                    width: calc(var(--switch-size) / 1.25);
                }
            }

            input {
                &:checked + .slider {
                    &:before {
                        transform: translateX(calc(var(--switch-size) / 1.25));
                    }
                }
            }
        }
    }
</style>
