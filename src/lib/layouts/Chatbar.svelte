<script>
    import { Button, Icon, Input } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from 'svelte-i18n'
    import { MarkdownEditor } from "markdown-editor"
    import { onMount } from "svelte";

    initLocale()

    /**
     * @type {HTMLElement}
     */
    let input;
    onMount(() => {
        let editor = new MarkdownEditor(
            input, {
            only_autolink: true
        });
        // @ts-ignore
        editor.updatePlaceholder(input.placeholder)
    })
</script>

<div class="chatbar">
    <Button 
        icon 
        appearance={Appearance.Alt} 
        tooltip={$_("chat.add_attachment")}>
        <Icon icon={Shape.Plus} />
    </Button>

    <Input bind:input={input} alt placeholder={$_("generic.placeholder")} rounded />

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