<script lang="ts">
    import { INTEGRATIONS } from "$lib/config"
    import { Button, Icon, Input, Label } from "$lib/elements"
    import { Appearance, IntegrationDisplays, Integrations, Shape } from "$lib/enums"
    import type { Integration } from "$lib/types"

    export let integration: Integration

    let display = INTEGRATIONS[integration.kind].display
</script>

<div class="integration" data-cy="account-integrations-item">
    <Label hook="label-account-integrations-item" text={key} />

    <div class="display">
        <img data-cy="account-integration-item-logo" class="logo" alt="logo" src={toIntegrationIconSrc(key)} />

        {#if display(key) === IntegrationDisplays.Text}
            <Input hook="input-platform-account-integration-item" value={key} disabled={!editable} />
            <Input hook="input-address-account-integration-item" value={value} disabled={!editable} />
            <Button hook="button-account-integration-item" appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Clipboard} />
            </Button>
        {/if}
        {#if display(key) === IntegrationDisplays.WalletAddress}
            <Input hook="input-account-integration-item" value={value} disabled={!editable} />
            <Button hook="button-account-integration-item" appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Clipboard} />
            </Button>
        {/if}
        {#if display(key) === IntegrationDisplays.URL}
            <Input hook="input-account-integration-item" value={value} disabled={!editable} />
            <Button hook="button-account-integration-item" appearance={Appearance.Alt} icon>
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
