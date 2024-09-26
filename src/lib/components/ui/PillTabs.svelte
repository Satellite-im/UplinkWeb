<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Button from "$lib/elements/Button.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import type { SimpleRoute } from "$lib/types"
    import Icon from "$lib/elements/Icon.svelte"

    export let tabs: SimpleRoute[] = []
    export let active: SimpleRoute = { name: "", icon: Shape.Beaker }

    const dispatch = createEventDispatcher()

    function handleTabClick(tab: SimpleRoute) {
        dispatch("nav", { tab })
    }
</script>

<div class="pill-tabs">
    {#each tabs as tab, index}
        <Button
            hook="button-{tab.name}"
            text={tab.name}
            small
            class={`pill ${index === 0 ? "tab-first" : index > 0 && index < tabs.length - 1 ? "tab-middle" : "tab-last"}`}
            appearance={active.name === tab.name ? Appearance.Primary : Appearance.Alt}
            on:click={() => handleTabClick(tab)}>
            <Icon icon={tab.icon} alt={active.name === tab.name} />
        </Button>
    {/each}
</div>

<style lang="scss">
    .pill-tabs {
        display: flex;
        width: 100%;
        justify-content: center;

        :global(.pill) {
            flex: 1;
        }

        :global(.tab-first) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        :global(.tab-middle) {
            border-radius: 0;
        }

        :global(.tab-last) {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    }
</style>
