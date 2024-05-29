<script lang="ts">
    export let text: string = ""
    export let hook: string = ""
</script>

<h2 class="title" data-cy={hook}>
    <slot></slot>{text}
</h2>

<style lang="scss">
    .title {
        font-size: var(--font-size-large);
    }
</style>
