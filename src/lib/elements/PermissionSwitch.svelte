<script lang="ts">
    import { PermissionState } from "$lib/enums/community"
    import { createEventDispatcher } from "svelte"

    export let state: PermissionState = PermissionState.Unset
    export let small: boolean = false
    export let hook: string = ""

    const dispatch = createEventDispatcher()

    function onToggle(_: Event) {
        if (state === PermissionState.Allowed) {
            state = PermissionState.Denied
        } else if (state === PermissionState.Unset) {
            state = PermissionState.Allowed
        } else {
            state = PermissionState.Unset
        }
        dispatch("toggle", state)
    }
</script>

<label class="switch {small ? 'small' : ''} {state}">
    <input data-cy={hook} type="checkbox" readonly on:click={onToggle} />
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
        }

        &.unset .slider {
            background-color: var(--alt-color);

            &:before {
                background-color: var(--color);
                transform: translateX(calc(var(--switch-size) / 2));
            }
        }

        &.allowed .slider {
            background-color: var(--success-color);

            &:before {
                background-color: var(--color);

                transform: translateX(var(--switch-size));
            }
        }

        &.denied .slider {
            background-color: var(--error-color);

            &:before {
                background-color: var(--color);

                transform: translateX(0);
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

            &.allowed .slider:before {
                transform: translateX(calc(var(--switch-size) / 1.25));
            }
        }
    }
</style>
