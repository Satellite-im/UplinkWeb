<script lang="ts">
    import { Button, Icon, Text } from "$lib/elements"

    import { Appearance, Shape, Size } from "$lib/enums"

    export let balance: number = 0

    const NumberFormatter = (value: number, decimal: number) => {
        return parseFloat(value.toFixed(decimal)).toLocaleString("en-US", {
            useGrouping: true,
        })
    }
</script>

<Button outline appearance={Appearance.Alt}>
    <Icon icon={Shape.Starlight} size={Size.Medium} highlight={Appearance.Warning} />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <Text size={Size.Small} secondaryFont>
        {NumberFormatter(balance, 2)}
    </Text>
</Button>
