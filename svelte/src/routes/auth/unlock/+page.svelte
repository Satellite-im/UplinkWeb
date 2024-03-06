<script lang="ts">
    import PinInput from "$lib/components/PinInput.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Spacer from "$lib/elements/Spacer.svelte";
    import Switch from "$lib/elements/Switch.svelte";
    import { initLocale } from "$lib/lang";
    import { onMount } from "svelte";
    import { _ } from 'svelte-i18n';

    initLocale();

    let create = false;
    let loading = false;
    let scramble = true;

    // TODO: Mock
    onMount(() => {
        loading = true;
        setTimeout(() => loading = false, 1500);
    })
</script>

<div id="auth-unlock">
    {#if loading}
        <Label text={$_('generic.loading')} />
    {:else}
        <Label text={(create) ? $_('pages.auth.unlock.choose_pin') : $_('pages.auth.unlock.enter_pin')} />
    {/if}
    <Spacer />
    <PinInput min={4} max={8} loading={loading} scramble={scramble} />
    <Spacer />
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