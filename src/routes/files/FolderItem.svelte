<script lang="ts">
    import { Icon } from "src/lib/elements"
    import { Shape } from "src/lib/enums"
    import type { FileInfo } from "src/lib/types"
    export let file: FileInfo
    export let openFolders: Record<string, boolean>
    export let toggleFolder: any

    function createClickHandler(file: FileInfo, isChild: boolean) {
        return function (event: { stopPropagation: () => void; preventDefault: () => void }) {
            event.stopPropagation()
            if (isChild) {
                event.preventDefault()
            }
            toggleFolder(file.id)
        }
    }
    $: folderOpenClosedIcon = () => {
        if (!openFolders[file.id] && file.type === "folder") {
            return Shape.Folder
        }
        if (openFolders[file.id] && file.type === "folder" && !file.items?.length) {
            return Shape.Folder
        }
        if (openFolders[file.id] && file.items?.length && file.type === "folder") {
            return Shape.FolderOpen
        }
        if (file.type === "file") {
            return Shape.Document
        }
        if (file.type === "image") {
            return Shape.Image
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

<li on:click={createClickHandler(file, false)}>
    <div class="tree">
        <Icon icon={folderOpenClosedIcon()} muted filled></Icon>
        {file.name}
        {#if openFolders[file.id] && file.items && file.items.length > 0}
            <ul>
                {#each file.items as item}
                    <svelte:self file={item} openFolders={openFolders} toggleFolder={toggleFolder} />
                {/each}
            </ul>
        {/if}
    </div>
</li>

<style>
    .tree > * {
        display: inline;
    }
    .tree {
        list-style-type: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    ul,
    li {
        margin-left: 10px;
    }
</style>
