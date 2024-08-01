<script lang="ts">
    import Controls from "$lib/layouts/Controls.svelte"
    import { Button, Icon, Label } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import UnderConstruction from "$lib/elements/UnderConstruction.svelte"
</script>

<div id="page">
    <Controls>
        <Button hook="button-installed" text={$_("settings.extensions.installed")} appearance={Appearance.Alt}>
            <Icon icon={Shape.CheckMark} />
        </Button>
        <Button hook="button-explore" text={$_("settings.extensions.explore")} appearance={Appearance.Alt} outline hideTextOnMobile>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button hook="button-settings" text={$_("settings.extensions.settings")} appearance={Appearance.Alt} outline hideTextOnMobile>
            <Icon icon={Shape.Cog} />
        </Button>
    </Controls>

    <div class="content">
        <UnderConstruction />
        <Label hook="label-no-extensions-installed" text={$_("settings.extensions.none")} />
    </div>
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        padding: var(--padding);

        .content {
            display: inline-flex;
            flex-direction: column;
            flex: 1;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
            min-width: 0;
        }
    }
</style>
