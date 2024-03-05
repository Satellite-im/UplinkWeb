<script lang="ts">
    import PinInput from "$lib/components/PinInput.svelte";
    import Label from "$lib/elements/Label.svelte";
    import { initLocale } from "$lib/lang";
    import { _ } from 'svelte-i18n';

    initLocale();

    let create = false;
</script>

<div id="auth-unlock">
    <Label text={(create) ? $_('pages.auth.unlock.choose_pin') : $_('pages.auth.unlock.enter_pin')} />
    <PinInput min={4} max={8} loading error />
</div>

<style lang="scss">
    #auth-unlock {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;
    }
</style>