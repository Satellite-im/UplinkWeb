<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { WalletStore } from "$lib/state/wallet"
    import { get } from "svelte/store"

    export let balance: number = 0

    const NumberFormatter = (value: number, decimal: number) => {
        return parseFloat(value.toFixed(decimal)).toLocaleString("en-US", {
            useGrouping: true,
        })
    }

    $: open = WalletStore.state.open

    const toggleWallet = (event: MouseEvent) => {
        console.log($open)
        if ($open) {
            WalletStore.closeWallet()
        } else {
            // Get the cursor's position relative to the viewport
            const x = event.clientX
            const y = event.clientY
            WalletStore.openWallet([y, x])
        }
    }
</script>

<Button outline appearance={Appearance.Alt} on:click={toggleWallet}>
    <Icon icon={Shape.Starlight} size={Size.Medium} highlight={Appearance.Warning} />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <Text size={Size.Small} secondaryFont>
        {NumberFormatter(balance, 2)}
    </Text>
</Button>
