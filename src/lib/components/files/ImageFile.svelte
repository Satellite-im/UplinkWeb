<script lang="ts">
    import { Text } from "$lib/elements"
    import prettyBytes from "pretty-bytes"
    import { Size } from "$lib/enums"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()
    function onClick(event: MouseEvent) {
        dispatch("click", event)
    }

    export let name: string = "UNKNOWN"
    export let filesize: number = 9821239999999999999999 // Intentionally alarming to signify error
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="image-file" on:click={onClick}>
    <img class="preview" src="/assets/library.avif" alt="preview" />
    <input type="text" value={name} />
    <Text size={Size.Smallest} muted>{prettyBytes(filesize)}</Text>
</div>

<style lang="scss">
    .image-file {
        height: var(--file-folder-size);
        width: var(--file-folder-size);
        overflow: hidden;
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: background-color var(--animation-speed);
        padding: var(--padding-less);

        .preview {
            max-height: var(--icon-size-largest);
            max-width: 100%;
            border-radius: var(--border-radius-minimal);
        }

        &:hover {
            background: var(--background-alt);
        }

        input {
            background-color: transparent;
            border: none;
            color: var(--color);
            text-align: center;
            width: 100%;
            border-radius: var(--border-radius-less);
            border: var(--border-width) solid transparent;
            text-overflow: ellipsis;

            &:focus {
                border: var(--border-width) solid var(--border-color);
                background-color: var(--alt-color);
                outline: none;
            }
        }

        :global(.svg-icon) {
            color: var(--warning-color);
            width: var(--icon-size-largest);
            height: var(--icon-size-largest);
        }
    }
</style>
