<script lang="ts">
    import { Icon, Text, Spacer } from "$lib/elements"
    import { FilesItemKind, Shape, Size } from "$lib/enums"
    import type { FileInfo } from "$lib/types";
    import prettyBytes from "pretty-bytes"

    export let kind: FilesItemKind = FilesItemKind.File
    export let info: FileInfo

    // function handleDndConsider(e: { detail: { items: { id: number, type: string, icon: Shape, size: number, name: string }[]; }; }) {
    //     items = e.detail.items
    // }
    // function handleDndFinalize(e: { detail: { items: { id: number, type: string, icon: Shape, size: number, name: string }[]; }; }) {
    //     items = e.detail.items
    // }

    // TODO: THIS GOES ON THE FILE use:dndzone="{{items, flipDurationMs}}" on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}"

    function getIcon() {
        switch (kind) {
            case FilesItemKind.File: return Shape.Document
            case FilesItemKind.Folder: return Shape.Folder
            case FilesItemKind.Image: return Shape.Beaker
        }
    }
</script>

<section>
    <div class="filesitem">
        <Icon icon={getIcon()} />
        <Spacer less />
        <input type="text" value={info?.name} />
        <Text size={Size.Smallest} muted>{prettyBytes(info?.size)}</Text>
    </div>
</section>

<style lang="scss">
    .filesitem {
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