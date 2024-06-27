<script lang="ts">
    import { Text } from "$lib/elements"

    export let text: string = ""
</script>

<div class="banner">
    <slot></slot>
    <Text hook="banner-text">{text}</Text>
</div>

<style lang="scss">
    .banner {
        width: 100%;
        padding: var(--padding);
        background-color: var(--alt-color);
        border-radius: var(--border-radius);
        display: inline-flex;
        align-items: center;
        gap: var(--gap);
    }
</style>
