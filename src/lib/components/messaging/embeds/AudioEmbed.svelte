<script lang="ts">
    import Text from "$lib/elements/Text.svelte";
    import { Size } from "$lib/enums";
    import prettyBytes from "pretty-bytes";

    export let location: string = ""
    export let name: string = ""
    export let size: number = 0
</script>


<div class="audio-embed">
    <audio controls>
        <source src={location}>
    </audio>
    <Text size={Size.Smaller}>{name} - {prettyBytes(size)}</Text> 
</div>

<style lang="scss">
    .audio-embed {
        min-width: var(--min-component-width);
        max-width: var(--max-component-width);
        width: fit-content;
        display: inline-flex;
        flex-direction: column;
        border-radius: var(--border-radius-medium);

    }
</style>