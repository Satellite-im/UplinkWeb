<script lang="ts">
    import { Label } from "$lib/elements"
    import { PinInput } from "$lib/components"
    import { goto } from '$app/navigation'
    import { Route } from "$lib/enums"

    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    initLocale()

    let create = false
    let loading = false
    let scramble = true
</script>

<div id="auth-unlock">
    {#if loading}
        <Label text={$_('generic.loading')} />
    {:else}
        <Label text={(create) ? $_('pages.auth.unlock.choose_pin') : $_('pages.auth.unlock.enter_pin')} />
    {/if}
    <PinInput min={4} max={8} loading={loading} scramble={scramble} showSettings={false} on:submit={() => {
        goto(Route.RecoverySeed);
    }}/>
</div>

<style lang="scss">
    #auth-unlock {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;
        padding: var(--padding);
        width: 100%;
        height: 100%;
    }
</style>