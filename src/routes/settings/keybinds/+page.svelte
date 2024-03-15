<script lang="ts">
    import { initLocale } from "$lib/lang"
    import { onMount } from "svelte"
    import { _ } from 'svelte-i18n'

    initLocale()

</script>

<div id="page">
    Keybinds
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
    }
</style>