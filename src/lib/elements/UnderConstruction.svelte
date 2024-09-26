<script lang="ts">
    import { Appearance, Shape, Size } from "$lib/enums"
    import Icon from "./Icon.svelte"
    import Text from "./Text.svelte"
    import { _ } from "svelte-i18n"
</script>

<div data-cy="under-construction" class="under-construction">
    <div class="container">
        <Icon icon={Shape.Construction} highlight={Appearance.Warning} size={Size.Large} />
        <Text appearance={Appearance.Warning}>{$_("generic.underConstruction")}</Text>
    </div>
</div>

<style lang="scss">
    .under-construction {
        display: inline-flex;
        gap: var(--gap);
        justify-content: center;
        align-items: center;
        .container {
            display: inline-flex;
            gap: var(--gap);
            justify-content: center;
            align-items: center;
            border: var(--border-width) solid var(--warning-color);
            border-radius: var(--border-radius);
            padding: 0 var(--padding-less);
        }
    }
</style>
