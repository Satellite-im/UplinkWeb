<script lang="ts">
    import type { FileInfo } from "$lib/types"
    export let file: FileInfo
    export let openFolders: Record<string, boolean>
    export let toggleFolder: any

    function createClickHandler(file: FileInfo, isChild: boolean) {
        return function(event: { stopPropagation: () => void; preventDefault: () => void; }) {
            event.stopPropagation()
            if (isChild) {
                event.preventDefault()
            }
            toggleFolder(file.id)
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li on:click={createClickHandler(file, false)} class:folder={file.items && file.items.length > 0} class:open={openFolders[file.id]}>
    {file.name}
    {#if openFolders[file.id] && file.items && file.items.length > 0}
        <ul>
            {#each file.items as item}
                <svelte:self
                    file={item}
                    openFolders={openFolders}
                    toggleFolder={toggleFolder}
                />
            {/each}
        </ul>
    {/if}
</li>

<style>
    .folder {
        position: relative;
        list-style-type: none;
        padding-left: 20px; /* Adjust the padding as needed */
    }

    .folder::before {
        content: "▶"; /* Default icon character */
        position: absolute;
        left: 0;
        top: 0;
        transition: transform 0.3s; /* Smooth transition for the transform property */
    }

    .folder.open::before {
        transform: rotate(90deg); /* Rotate the icon to point down */
    }

    .folder.no-items::before {
        list-style-type: none;
        content: ""; /* No icon when folder has no items */
    }
</style>