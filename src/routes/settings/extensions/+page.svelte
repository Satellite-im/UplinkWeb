<script lang="ts">
    import Controls from "$lib/layouts/Controls.svelte";
import { Button, Icon, Label } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'

    initLocale()
</script>

<div id="page">
    <Controls>
        <Button text="Installed" appearance={Appearance.Alt}>
            <Icon icon={Shape.CheckMark} />
        </Button>
        <Button text="Explore" appearance={Appearance.Alt} outline>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button text="Settings" appearance={Appearance.Alt} outline>
            <Icon icon={Shape.Cog} />
        </Button>
    </Controls>

    <div class="content">
        <Label text="No extensions installed." />
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        flex-direction: column;
        margin: 0;
        flex: 1;
        gap: var(--gap);
        height: 100%;
        overflow-y: scroll;
        padding-right: var(--padding);

        .content {
            display: inline-flex;
            flex-direction: column;
            flex: 1;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
        }
    }
</style>