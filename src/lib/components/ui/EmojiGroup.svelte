<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape } from "$lib/enums"

    export let emojis: string[]
    export let close: (event: MouseEvent) => void
    export let emojiPick: (emoji: string) => void
</script>

<div class="emoji-group" data-cy="emoji-group">
    {#each emojis as emoji}
        <Button
            hook="button-emoji-{emoji}"
            class="emoji"
            appearance={Appearance.Alt}
            text={emoji}
            on:click={e => {
                emojiPick(emoji)
                close(e)
            }} />
    {/each}
    <Button
        hook="button-emoji-picker"
        class="emoji-picker"
        appearance={Appearance.Alt}
        on:click={e => {
            // Open emoji picker
            close(e)
        }}><Icon icon={Shape.Plus} /></Button>
</div>

<style lang="scss">
    .emoji-group {
        display: inline-flex;
        gap: var(--gap-less);
        justify-content: space-between;
        :global(.emoji) {
            height: var(--input-height);
            width: var(--input-height);
            min-width: var(--input-height);
        }
        :global(.emoji-picker) {
            height: var(--input-height);
            width: var(--input-height);
            min-width: var(--input-height);
        }
    }
</style>
