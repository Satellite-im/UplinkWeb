<script lang="ts">
    import { Icon, Label } from "$lib/elements"
    import { Size } from "$lib/enums"
    import Digit from "./Digit.svelte"

    export let selectedCurrency

    let balanceChars: any[] = []

    // Split the balance into individual characters
    $: if (selectedCurrency) {
        const balanceStr = selectedCurrency.balance.toString()
        balanceChars = balanceStr.split("")
    }
</script>

<div class="balance">
    <div class="num">
        <Icon icon={selectedCurrency.icon} size={Size.Larger} muted filled />
        {#each balanceChars as char, index}
            {#if char >= "0" && char <= "9"}
                <Digit targetDigit={parseInt(char)} duration={1000 + index * 100} />
            {:else}
                <!-- Display non-digit characters (e.g., decimal point) -->
                <span class="digit">{char}</span>
            {/if}
        {/each}
    </div>
    <div class="label">
        <Label text={selectedCurrency.name} />
    </div>
</div>

<style lang="scss">
    .balance {
        display: inline-flex;
        flex-direction: column;
        padding: calc(var(--padding) * 2) var(--padding);

        .num {
            font-size: calc(var(--font-size-large) * 2);
            display: inline-flex;
            color: var(--warning-color);
            align-items: center;

            .digit {
                display: inline-block;
            }
        }

        .label {
            display: inline-flex;
            flex: 1;
            justify-content: flex-end;
        }
    }
</style>
