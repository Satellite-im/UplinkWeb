<script lang="ts">
    import PinInput from "$lib/components/PinInput.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Spacer from "$lib/elements/Spacer.svelte";
    import { goto } from '$app/navigation';
    import { initLocale } from "$lib/lang";
    import { onMount } from "svelte";
    import { _ } from 'svelte-i18n';
    import Logo from "$lib/elements/Logo.svelte";
    import { Route } from "$lib/enums";

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
    <Logo />
    <Spacer less />
    {#if loading}
        <Label text={$_('generic.loading')} />
    {:else}
        <Label text={(create) ? $_('pages.auth.unlock.choose_pin') : $_('pages.auth.unlock.enter_pin')} />
    {/if}
    <Spacer />
    <PinInput min={4} max={8} loading={loading} scramble={scramble} showSettings={false} on:submit={() => {
        goto(Route.RecoverySeed);
    }}/>
    <Spacer />
</div>

<style lang="scss">
    #auth-unlock {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
</style>