<script lang="ts">
    import { HighlightAuto } from "svelte-highlight"
    import Highlight, { LineNumbers } from "svelte-highlight"
    import self from "./TextDocument.svelte?raw"
    import atomOneDark from "svelte-highlight/styles/atom-one-dark"
</script>

<svelte:head>
    {@html atomOneDark}
</svelte:head>

<div class="text-document">
    <HighlightAuto code={self} let:highlighted>
        <LineNumbers highlighted={highlighted} hideBorder wrapLines />
    </HighlightAuto>
</div>

<style lang="scss">
    .text-document {
        min-height: var(--min-scrollable-height);
        max-height: var(--base-scrollable-height);
        overflow-y: scroll;
        padding-right: var(--padding-minimal);
        border-radius: var(--border-radius);

        :global(code) {
            background-color: transparent;
        }

        :global(.hljs) {
            background-color: var(--background);
        }
    }
</style>
