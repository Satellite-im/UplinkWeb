<script lang="ts">
    import { goto } from "$app/navigation"
    import { OrderedPhrase } from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Button, Icon, Text, Title } from "$lib/elements"
    import { Appearance, Route, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { createEventDispatcher } from "svelte"

    initLocale()

    const dispatch = createEventDispatcher()

    export let phrase: string[]
    let loading = false
</script>

<div id="auth-recover">
    <div class="header">
        <Title>{$_("pages.auth.recovery.title")}</Title>
        <Text muted>{$_("pages.auth.recovery.save_warning")}</Text>
    </div>
    {#each phrase as word, i}
        <OrderedPhrase number={i + 1} word={word} loading={loading} />
    {/each}
    <Controls>
        <Button class="full-width" text={$_("pages.auth.recovery.download")} appearance={Appearance.Alt} loading={loading}>
            <Icon icon={Shape.Download} />
        </Button>
        <Button
            class="full-width"
            text={$_("pages.auth.recovery.next_step")}
            loading={loading}
            on:click={_ => {
                loading = true
                dispatch("click")
            }}>
            <Icon icon={Shape.ArrowRight} />
        </Button>
    </Controls>
</div>

<style lang="scss">
    #auth-recover {
        align-self: center;
        align-content: center;
        justify-content: center;
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
    }
</style>
