<script lang="ts">
    export let text: string = "";
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="label">
    {text}
</label>

<style lang="scss">
    .label {
        font-size: var(--label-size);
        user-select: none;
    }
</style>
