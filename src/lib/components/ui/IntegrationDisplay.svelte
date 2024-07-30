<script lang="ts">
    import { INTEGRATIONS } from "$lib/config"
    import { Button, Icon, Input, Label } from "$lib/elements"
    import { Appearance, IntegrationDisplays, Integrations, Shape } from "$lib/enums"

    export let key: string
    export let value: string
    export let editable: boolean = false

    function toIntegrationKind(key: string) {
        let integration_kind = Integrations[key as keyof typeof Integrations]
        if (integration_kind === undefined) {
            integration_kind = Integrations.Generic
        }
        return integration_kind
    }
    function display(key: string) {
        return INTEGRATIONS[toIntegrationKind(key)].display
    }
</script>

<div class="integration">
    <Label text={key} />

    <div class="display">
        <img class="logo" src="/assets/brand/{toIntegrationKind(key)}.png" />

        {#if display(key) === IntegrationDisplays.Text}
            <Input value={key} disabled={!editable} />
            <Input value={value} disabled={!editable} />
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Clipboard} />
            </Button>
        {/if}
        {#if display(key) === IntegrationDisplays.WalletAddress}
            <Input value={value} disabled={!editable} />
            <Button appearance={Appearance.Alt} icon>
                <Icon icon={Shape.Clipboard} />
            </Button>
        {/if}
        {#if display(key) === IntegrationDisplays.URL}
            <Input value={value} disabled={!editable} />
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
