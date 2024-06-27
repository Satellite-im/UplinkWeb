<script lang="ts">
    import RelaySelector from "$lib/components/ui/RelaySelector.svelte"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"

    initLocale()
</script>

<div id="page">
    <RelaySelector />
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
