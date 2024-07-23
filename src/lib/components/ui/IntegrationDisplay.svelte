<script lang="ts">
    import { INTEGRATIONS } from "$lib/config"
    import { Button, Icon, Input, Label } from "$lib/elements"
    import { Appearance, IntegrationDisplays, Integrations, Shape } from "$lib/enums"
    import type { Integration } from "$lib/types"

    export let integration: Integration

    let display = INTEGRATIONS[integration.kind].display
</script>

<div class="integration">
    <Label text={integration.kind} />

    <div class="display">
        <!-- svelte-ignore a11y-missing-attribute -->
        <img class="logo" src="/assets/brand/{integration.kind}.png" />

        {#if display === IntegrationDisplays.WalletAddress}
            <Input value={integration.location} />
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Clipboard} />
            </Button>
        {/if}
        {#if display === IntegrationDisplays.URL}
            <Input value={integration.location} />
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.ArrowRight} />
            </Button>
        {/if}
    </div>
</div>

<style lang="scss">
    .integration {
        flex: 1;
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);

        .display {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);
            .logo {
                width: var(--input-height);
            }
        }
    }
</style>
