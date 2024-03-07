<script lang="ts">
    import Icon from "$lib/elements/Icon.svelte";
    import { Appearance, Shape } from "$lib/enums";

    export let balance: number = 0;
    export let highlight: Appearance = Appearance.Default;
</script>

<div class="coin-balance highlight-{highlight}">
    <div class="icon">
        <Icon icon={Shape.Coins} />
    </div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label balance">{balance}</label>
</div>

<style lang="scss">
    .coin-balance {
        display: inline-flex;
        flex-direction: row;
        gap: var(--gap);
        align-items: center;
        padding: var(--padding-less) var(--padding);
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--border-radius);
        background-color: var(--alt-color);

        .balance {
            color: var(--color);
        }

        &.highlight-success {
            border-color: var(--success-color);
        }

        &.highlight-info {
            border-color: var(--info-color);
        }

        &.highlight-warning {
            border-color: var(--warning-color);
        }

        &.highlight-error {
            border-color: var(--error-color);
        }
    }
</style>