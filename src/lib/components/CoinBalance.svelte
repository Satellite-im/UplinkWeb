<script lang="ts">
    import { Button, Icon } from "$lib/elements"

    import { Appearance, Shape } from "$lib/enums"

    export let balance: number = 0

    const NumberFormatter = (value: number, decimal: number) => {
        return parseFloat(value.toFixed(decimal)).toLocaleString(
            "en-US",
            {
                useGrouping: true,
            }
        )
    }
</script>

<Button 
    outline 
    appearance={Appearance.Alt}>
    <Icon icon={Shape.Coins} />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">
        {NumberFormatter(balance, 2)}
    </label>
</Button>
