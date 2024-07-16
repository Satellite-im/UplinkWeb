<script lang="ts">
    import { Button, Icon, Label } from "$lib/elements"
    import Text from "$lib/elements/Text.svelte"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"

    initLocale()
</script>

<div id="page">
    <Label text="Realms" />
    <Text>Realms let you choose how Uplink works behind the scenes.</Text>
    <Text>
        You can join or change a realm at any time but please be aware that you must be on the same realm as someone to have a direct message conversation with them. If you want to meet up with lots of people from all different realms you
        can create a community!
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
