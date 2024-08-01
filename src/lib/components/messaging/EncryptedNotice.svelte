<script lang="ts">
    import { Icon, Text } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import { _ } from "svelte-i18n"
</script>

<div class="encrypted-notice" data-cy="chat-encrypted-notice">
    <Icon icon={Shape.Lock} />
    <Text hook="chat-encrypted-text" size={Size.Smaller}>{$_("chat.encrypted")}</Text>
</div>

<style lang="scss">
    .encrypted-notice {
        width: 100%;
        display: inline-flex;
        gap: var(--gap);
        background: var(--alt-color);
        padding: var(--padding-less);
        border-radius: var(--border-radius-more);
        justify-content: center;
        align-items: center;
        margin-bottom: var(--padding-less);
    }
</style>
