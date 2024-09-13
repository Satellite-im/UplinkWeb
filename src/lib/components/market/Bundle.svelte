<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance } from "$lib/enums"
    import { Shape } from "$lib/enums/icons"
    import Controls from "$lib/layouts/Controls.svelte"
    import type { Bundle } from "$lib/types"

    export let bundle: Bundle = {
        name: "Kitsune",
        image: "/assets/market/kitsune/kitsune-bundle.png",
        description: "",
        price: 0,
        frames: [],
        overlays: [],
        themes: [],
        fonts: [],
        titles: [],
        trinkets: [],
    }
</script>

<div class="bundle">
    <img src={bundle.image} alt={bundle.name} />
    <Controls>
        <Button appearance={Appearance.Alt} text="Wishlist">
            <Icon icon={Shape.Plus} />
        </Button>
        <Button appearance={Appearance.Primary} text="Purchase Bundle">
            <Icon icon={Shape.Starlight} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    .bundle {
        border-radius: var(--border-radius);
        overflow: hidden;
        background: var(--alt-color-alt);
        max-width: 900px;
        min-width: var(--min-component-width);

        :global(.controls) {
            padding: var(--padding);
        }
    }
</style>
