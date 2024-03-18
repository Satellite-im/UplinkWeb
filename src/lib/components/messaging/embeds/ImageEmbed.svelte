<script lang="ts">
    import { createEventDispatcher } from "svelte"

    export let source: string   = ""
    export let alt: string      = ""
    export let big: boolean     = false

    const dispatch = createEventDispatcher()
    function onClick(event: MouseEvent) {
        dispatch('click', event)
    }
</script>

<div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img class={big ? "image-big" : "image"} src={source} alt={alt} on:click={onClick}/>
</div>

<style lang="scss">
    :global(.image-big) {
        max-width: 100%;
        max-height: 100%;
    }
    .image {
        max-width: var(--max-component-width);
        border-radius: var(--border-radius);
        transition: all var(--animation-speed);
        cursor: pointer;

        &:hover {
            border-radius: var(--border-radius-minimal);
        }
    }
</style>