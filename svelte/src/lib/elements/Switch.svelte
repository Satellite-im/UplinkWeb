<script lang="ts">
    export let on: boolean = false;
</script>

<label class="switch">
    <input type="checkbox" bind:checked={on} />
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

            &:focus + .slider { // Accessibility support
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
                border-radius: var(--switch-size);
                background-color: var(--color);
                transition: var(--animation-speed);
                box-shadow: 0 0 0 var(--shadow-depth) var(--border-color);
            }
        }
    }
</style>