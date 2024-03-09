<script>
    import Button from "$lib/elements/Button.svelte";
    import Icon from "$lib/elements/Icon.svelte";
    import Input from "$lib/elements/Input.svelte";
    import { Appearance, Shape } from "$lib/enums";

</script>
<div class="chatbar">
    <Button icon appearance={Appearance.Alt} tooltip="Add Attachment">
        <Icon icon={Shape.Plus} />
    </Button>

    <Input alt placeholder="Say something..." />

    <Button icon appearance={Appearance.Alt} tooltip="Send Coin">
        <Icon icon={Shape.SendCoin} />
    </Button>

    <Button icon appearance={Appearance.Alt} tooltip="Emoji">
        <Icon icon={Shape.Smile} />
    </Button>

    <Button icon tooltip="Send">
        <Icon icon={Shape.ChevronRight} />
    </Button>
</div>

<style lang="scss">
    .chatbar {
        display: inline-flex;
        align-items: center;
        padding: var(--padding);
        gap: var(--gap-less);
        width: 100%;
        border-top: var(--border-width) solid var(--border-color);

        :global(.input-group .input-container) {
            border-radius: var(--border-radius-more);
        }
    }
</style>