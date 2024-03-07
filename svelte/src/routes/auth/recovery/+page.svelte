<script lang="ts">
    import OrderedPhrase from "$lib/components/OrderedPhrase.svelte";
    import Label from "$lib/elements/Label.svelte";
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
    <div class="phrase-container">
        <div class="header">
            <Label text={$_('pages.auth.recovery.save_warning')} />
        </div>
        {#each samplePhrase as word, i}
            <OrderedPhrase number={i + 1} word={word} loading={loading} />
        {/each}
    </div>
</div>

<style lang="scss">
    #auth-recover {
        display: inline-flex;
        flex-direction: column;
        flex: 1;
        align-items: center;
        justify-content: center;

        .phrase-container {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
            padding: var(--padding);
            max-width: var(--max-component-width);
            flex-wrap: wrap;

            .header {
                width: 100%;
                text-align: center;
            }
        }
    }
</style>