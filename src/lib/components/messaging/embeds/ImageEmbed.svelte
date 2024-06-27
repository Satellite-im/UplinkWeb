<script lang="ts">
    import Text from "$lib/elements/Text.svelte"
    import { Size } from "$lib/enums"
    import { createEventDispatcher } from "svelte"
    import prettyBytes from "pretty-bytes"

    export let filesize: number = 0
    export let source: string = ""
    export let name: string = ""
    export let alt: string = ""
    export let big: boolean = false

    const dispatch = createEventDispatcher()
    function onClick(event: MouseEvent) {
        dispatch("click", event)
    }
</script>

<div class="container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img class={big ? "image-big" : "image"} src={source} alt={alt} on:click={onClick} />

    {#if name}
        <div class="details">
            <Text size={Size.Smaller}>{name}</Text>
            {#if filesize}
                <Text size={Size.Smaller}>{prettyBytes(filesize)}</Text>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    :global(.image-big) {
        max-width: 100%;
        max-height: 100%;
    }
    .container {
        background-color: var(--background-alt);
        border-radius: var(--border-radius);

        .image {
            min-width: var(--min-component-width);
            width: var(--max-component-width);
            border-radius: var(--border-radius);
            transition: all var(--animation-speed);
            cursor: pointer;

            &:hover {
                border-radius: var(--border-radius-minimal);
            }
        }
        .details {
            display: inline-flex;
            padding: var(--padding-minimal) var(--padding-less);
            gap: var(--gap);
        }
    }
</style>
