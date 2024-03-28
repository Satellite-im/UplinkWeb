<script lang="ts">
    import { Icon, Text, Spacer } from "$lib/elements"
    import { Shape, Size } from "$lib/enums"
    import { mock_files } from "$lib/mock/files"
    import prettyBytes from "pretty-bytes"
    import {dndzone} from "svelte-dnd-action"
    import {flip} from "svelte/animate"

    export let name: string = "UNKNOWN"
    export let filesize: number = 9821239999999999999999 // Intentionally alarming to signify error
    const flipDurationMs = 300

    let items = mock_files

    function handleDndConsider(e: { detail: { items: { id: number, type: string, icon: Shape, size: number, name: string }[]; }; }) {
        items = e.detail.items
    }
    function handleDndFinalize(e: { detail: { items: { id: number, type: string, icon: Shape, size: number, name: string }[]; }; }) {
        items = e.detail.items
    }
</script>

<section use:dndzone="{{items, flipDurationMs}}" on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
    {#each items as file(file.id)}
    <div class="{file.type}" animate:flip="{{duration: flipDurationMs}}">
        <Icon icon={file.icon} />
        <Spacer less />
        <input type="text" value={file.name} />
        <Text size={Size.Smallest} muted>{prettyBytes(file.size)}</Text>
    </div>
    {/each}
</section>

<style lang="scss">
    .file {
        height: var(--file-folder-size);
        width: var(--file-folder-size);
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: background-color var(--animation-speed);
        padding: var(--padding-less);

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
    .folder {
        height: var(--file-folder-size);
        width: var(--file-folder-size);
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: background-color var(--animation-speed);
        padding: var(--padding-less);

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