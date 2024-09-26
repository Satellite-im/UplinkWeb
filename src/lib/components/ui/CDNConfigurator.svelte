<script lang="ts">
    import { DEFAULT_CDN } from "$lib/config"
    import { Button, Icon, Input, Label, UnderConstruction } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { _ } from "svelte-i18n"

    export let address: string = DEFAULT_CDN.address
    export let name: string = DEFAULT_CDN.name
</script>

<div id="cdn-entry">
    <UnderConstruction />

    <Label hook="label-cdn" text="CDN URL" />
    <div class="cdn-content">
        <Input hook="input-cdn-name" placeholder={$_("settings.network.cdn.namePlaceholder")} bind:value={name} disabled />
        <Input hook="input-cdn-address" highlight={Appearance.Success} placeholder={$_("settings.network.cdn.addressPlaceholder")} bind:value={address} disabled>
            <Icon icon={Shape.Lock} />
        </Input>
        <Button hook="button-cdn-save" appearance={Appearance.Alt} text={$_("generic.save")}>
            <Icon icon={Shape.CheckMark} />
        </Button>
    </div>
</div>

<style lang="scss">
    #cdn-entry {
        display: inline-flex;
        flex-direction: column;
        border: var(--border-width) solid var(--warning-color);
        border-radius: var(--border-radius);
        padding: var(--padding);

        .cdn-content {
            display: inline-flex;
            gap: var(--gap);
        }
    }
</style>
