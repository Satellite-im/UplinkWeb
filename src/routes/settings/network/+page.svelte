<script lang="ts">
    import CdnConfigurator from "$lib/components/ui/CDNConfigurator.svelte"
    import RelaySelector from "$lib/components/ui/RelaySelector.svelte"

    import { _ } from "svelte-i18n"
</script>

<div id="page">
    <RelaySelector />
    <CdnConfigurator />
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
