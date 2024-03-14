<script lang="ts">
    export let text: string = ""
</script>

<h2 class="title">
    <slot></slot>{text}
</h2>

<style lang="scss">
    .title {
        font-size: var(--font-size-large);
        font-family: 'Secondary';
    }
</style>