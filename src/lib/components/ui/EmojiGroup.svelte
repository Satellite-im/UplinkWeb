<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape } from "$lib/enums"

    export let emojis: string[]
    export let close: (event: CustomEvent<MouseEvent>) => void
</script>

<div class="emoji-group">
    {#each emojis as emoji}
        <Button
            class="emoji"
            appearance={Appearance.Alt}
            text={emoji}
            on:click={e => {
                // TODO add reaction
                const customEvent = new CustomEvent('customMouseEvent', {
                    detail: e,
                    });
                close(customEvent)
            }} />
    {/each}
    <Button
        class="emoji-picker"
        appearance={Appearance.Alt}
        on:click={e => {
            // Open emoji picker
            const customEvent = new CustomEvent('customMouseEvent', {
                    detail: e,
            });
            close(customEvent)
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
