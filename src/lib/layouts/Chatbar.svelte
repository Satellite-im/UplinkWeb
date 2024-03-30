<script>
    import { Button, Icon, Input } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import Controls from "./Controls.svelte"
    initLocale()
</script>

<div class="chatbar">
    <Controls>
        <slot name="pre-controls"></slot>
    </Controls>

    <Input alt placeholder={$_("generic.placeholder")} rounded rich />

    <slot></slot>

    <Button icon tooltip={$_("chat.send")}>
        <Icon icon={Shape.ChevronRight} />
    </Button>
</div>

<style lang="scss">
    .chatbar {
        display: inline-flex;
        align-items: center;
        padding: var(--padding-less);
        gap: var(--gap);
        width: 100%;
        border-top: var(--border-width) solid var(--border-color);
    }
</style>