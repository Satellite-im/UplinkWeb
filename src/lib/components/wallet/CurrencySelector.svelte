<script lang="ts">
    import { Icon } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import type { Currency } from "$lib/types/wallet"
    import { createEventDispatcher, onMount, onDestroy } from "svelte"

    export let currencies: Currency[] = []
    export let selectedCurrency: Currency
    let showCurrencyOptions = false

    const dispatch = createEventDispatcher()

    function toggleCurrencyOptions() {
        showCurrencyOptions = !showCurrencyOptions
    }

    function selectCurrency(currency: Currency) {
        if (currency.enabled) {
            selectedCurrency = currency
            showCurrencyOptions = false
            dispatch("currencySelected", currency)
        }
    }

    function handleClickOutside(event: MouseEvent) {
        const dropdown = document.querySelector(".select-group")
        if (dropdown && !dropdown.contains(event.target as Node)) {
            showCurrencyOptions = false
        }
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside)
    })

    onDestroy(() => {
        document.removeEventListener("click", handleClickOutside)
    })

    // Sort currencies: enabled first, then disabled
    $: sortedCurrencies = currencies.slice().sort((a, b) => {
        if (a.enabled === b.enabled) return 0
        if (a.enabled) return -1
        return 1
    })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="select-group" on:click={toggleCurrencyOptions}>
    <div class="selected-option">
        <Icon icon={selectedCurrency.icon} filled />
        <span>{selectedCurrency.name}</span>
    </div>
    <Icon icon={Shape.ChevronDown} />
    {#if showCurrencyOptions}
        <ul class="options-list">
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            {#each sortedCurrencies as currency}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <li class="option {currency.enabled ? '' : 'disabled'}" on:click={() => selectCurrency(currency)}>
                    <Icon icon={currency.icon} filled size={Size.Large} />
                    <span>{currency.name}</span>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style lang="scss">
    .select-group {
        position: relative;
        height: var(--input-height, 40px);
        color: var(--color-alt, #fff);
        background-color: var(--alt-color-alt, #2d2d2d);
        border: var(--border-width, 1px) solid var(--border-color, #444);
        border-radius: var(--border-radius-more);
        padding: 0 var(--padding, 8px);
        font-size: var(--font-size-smaller, 14px);
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        gap: var(--gap);
        width: 100%;

        .selected-option {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }

        .options-list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            padding: var(--padding-less);
            margin: 0;
            background-color: var(--opaque-color);
            backdrop-filter: blur(var(--blur-radius));
            border-radius: var(--border-radius);
            margin-top: var(--gap-less);
            border: var(--border-width) solid var(--border-color);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;

            .option {
                height: var(--input-height);
                display: flex;
                align-items: center;
                padding: var(--padding);
                gap: var(--gap);
                cursor: pointer;
                border-radius: var(--border-radius-more);

                &:hover {
                    background-color: var(--primary-color);
                }
            }

            .disabled {
                opacity: 0.5;
                pointer-events: none;
            }
        }

        :global(.svg-icon) {
            pointer-events: none;
        }
    }
</style>
