<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import Label from "$lib/elements/Label.svelte";
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import SettingSection from "$lib/layouts/SettingSection.svelte"
    import { _ } from 'svelte-i18n'

    initLocale()
</script>

<div id="page">
    <div class="controls">
        <Button text="Installed" appearance={Appearance.Alt}>
            <Icon icon={Shape.CheckMark} />
        </Button>
        <Button text="Explore" appearance={Appearance.Alt} outline>
            <Icon icon={Shape.Beaker} />
        </Button>
        <Button text="Settings" appearance={Appearance.Alt} outline>
            <Icon icon={Shape.Cog} />
        </Button>
    </div>

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

        .controls {
            width: 100%;
            display: inline-flex;
            gap: var(--gap);
            justify-content: flex-end;
        }

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