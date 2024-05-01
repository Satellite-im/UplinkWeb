<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"

    initLocale()
</script>

<div id="page">
    Inventory
</div>

<style lang="scss">
    #page {
        flex: 1;
        width: 100%;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: var(--padding);
    }
</style>