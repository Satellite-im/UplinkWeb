<script lang="ts">
    export let checked: boolean = false
    export let hook: string = ""
    export let onToggle: (current: boolean) => boolean = _ => true
    export let disabled = false
</script>

<input
    data-cy={hook}
    type="checkbox"
    checked={checked}
    class="{checked ? 'checked' : ''} {disabled ? 'disabled' : ''}"
    disabled={disabled}
    on:click={_ => {
        if (onToggle(!checked)) {
            checked = !checked
        }
    }} />
<slot></slot>

<style lang="scss">
    input[type="checkbox"] {
        appearance: none;
        background-color: transparent;
        width: var(--checkbox-size);
        height: var(--checkbox-size);
        border: calc(var(--border-width) * 2) solid var(--color);
        border-radius: var(--border-radius-minimal);
        display: grid;
        place-content: center;
        transition: all var(--animation-speed);

        &:focus {
            box-shadow: 0 0 0 var(--shadow-depth) var(--focus-color);
            border-color: var(--info-color);
            outline: none;
        }

        &:hover {
            cursor: pointer;
        }

        &::before {
            content: "";
            width: 0.65em;
            height: 0.65em;
            transform: scale(0);
            transition:
                var(--animation-speed) transform var(--animation-style),
                var(--animation-speed) border-color var(--animation-style);
            box-shadow: inset 2em 2em var(--form-control-color);
            clip-path: polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
        }

        &.disabled {
            border-color: var(--color-muted);
            cursor: auto;
        }

        &.checked {
            border-color: var(--color);

            &::before {
                transform: scale(1);
                background-color: var(--color);
            }
        }
    }
</style>
