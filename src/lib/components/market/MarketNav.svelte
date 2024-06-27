<script>
    import { Spacer, Button, Label, Icon } from "src/lib/elements"
    import { Appearance, Shape } from "src/lib/enums"
</script>

<div class="market-nav">
    <Button text="Bundles & Packs" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>

    <Label text="Filter" />

    <Button text="Staff Picks" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Recently Updated" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Most Downloaded" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Newly Added" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>

    <Spacer />

    <Label text="Categories" />
    <Button text="Community Upgrades" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Extensions" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Themes" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Stickers & Emotes" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Sounds & Fonts" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text="Bots & Moderation" fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
</div>

<style lang="scss">
    .market-nav {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap-less);
    }
</style>
