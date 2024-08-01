<script>
    import { Spacer, Button, Label, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"
</script>

<div class="market-nav">
    <Button text={$_("market.bundles")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>

    <Label text={$_("market.filter")} />

    <Button text={$_("market.staff")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.recentlyUpdated")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.mostDownloaded")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.newlyAdded")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>

    <Spacer />

    <Label text={$_("market.categories")} />
    <Button text={$_("market.communityUpgrades")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.extensions")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.themes")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.stickers")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.sounds")} fill appearance={Appearance.Alt}>
        <Icon icon={Shape.Beaker} />
    </Button>
    <Button text={$_("market.bots")} fill appearance={Appearance.Alt}>
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
