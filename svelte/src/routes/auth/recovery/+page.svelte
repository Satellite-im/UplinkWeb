<script lang="ts">
    import { goto } from "$app/navigation";
    import OrderedPhrase from "$lib/components/OrderedPhrase.svelte";
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Label from "$lib/elements/Label.svelte";
    import Spacer from "$lib/elements/Spacer.svelte";
    import Title from "$lib/elements/Title.svelte";
    import { Appearance, Route, Shape } from "$lib/enums";
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

    let samplePhrase = "agree alarm acid actual actress acid album admit absurd adjust adjust air".split(" ");
</script>

<div id="auth-recover">
    <div class="header">
        <Title>{$_('pages.auth.recovery.title')}</Title>
        <Label text={$_('pages.auth.recovery.save_warning')} />
    </div>
    <Spacer />
    {#each samplePhrase as word, i}
        <OrderedPhrase number={i + 1} word={word} loading={loading} />
    {/each}
    <Spacer />
    <div class="controls">
        <Button 
            class="full-width" 
            text={$_('pages.auth.recovery.download')} 
            appearance={Appearance.Alt} 
            loading={loading} >
            <Icon icon={Shape.Download} />            
        </Button>
        <Button 
            class="full-width"
            text={$_('pages.auth.recovery.next_step')} 
            loading={loading}
            on:click={() => goto(Route.NewAccount)} >
            <Icon icon={Shape.ArrowRight} />            
        </Button>
    </div>
</div>

<style lang="scss">
    #auth-recover {
        align-self: center;
        align-content: center;
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        padding: var(--padding);
        max-width: var(--max-component-width);
        flex-wrap: wrap;
        flex: 1;

        .header {
            width: 100%;
            text-align: center;
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
        }
        
        .controls {
            gap: var(--gap);
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            flex: 100%;
            flex-wrap: wrap;
        }
    }
</style>