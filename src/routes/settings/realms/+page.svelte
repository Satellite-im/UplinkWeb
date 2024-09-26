<script lang="ts">
    import { Button, Icon, Label } from "$lib/elements"
    import Text from "$lib/elements/Text.svelte"

    import { _ } from "svelte-i18n"
</script>

<div id="page">
    <Label hook="label-settings-realms" text={$_("settings.realms.name")} />
    <Text hook="text-settings-realms-description-1">{$_("settings.realms.description1")}</Text>
    <Text hook="text-settings-realms-description-2">
        {$_("settings.realms.description2")}
    </Text>
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        padding: var(--padding);
    }
</style>
