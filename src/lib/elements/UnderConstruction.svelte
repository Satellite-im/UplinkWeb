<script lang="ts">
    import { Appearance, Shape } from "$lib/enums"
    import Icon from "./Icon.svelte"
    import Text from "./Text.svelte";

</script>

<div class="under-construction">
    <Icon icon={Shape.Construction} highlight={Appearance.Warning} />
    <Text appearance={Appearance.Warning}>Under Construction</Text>
</div>

<style lang="scss">
    .under-construction {
        display: inline-flex;
        gap: var(--gap);
        justify-content: center;
        align-items: center;
    }
</style>