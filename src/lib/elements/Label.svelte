<script lang="ts">
    export let text: string = ""
    export let small: boolean = false
    export let hook: string = ""

    let clazz = ""
    export { clazz as class }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label {small ? 'small' : ''} {clazz}" data-cy={hook}>
    {text}
</label>

<style lang="scss">
    .label {
        font-size: var(--label-size);
        color: var(--color-muted);
        user-select: none;
        text-transform: uppercase;

        &.small {
            font-size: var(--font-size-smaller);
        }
    }
</style>
