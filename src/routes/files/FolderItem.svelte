<script lang="ts">
  import { Icon } from "$lib/elements";
  import { Shape } from "$lib/enums";
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
    let folderOpenClosedIcon =  () => {if (file.items && file.items.length > 0 && file.type === "folder") {
        return Shape.Folder
    } else if(openFolders[file.id] && file.type === "folder") {return Shape.FolderOpen}
    if(file.type === "file") {return Shape.Document}
    if(file.type === "image") {return Shape.Image}}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li on:click={createClickHandler(file, false)} class:folder={file.items && file.items.length > 0} class:open={openFolders[file.id]}>
    <Icon
    icon={folderOpenClosedIcon()}
    muted
    filled
    ></Icon>
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
  
    /* .folder {
        position: relative;
        padding-left: 20px; 
    }

    .folder::before {
        content: "📁"; 
        position: absolute;
        left: 0;
        top: 0;
        color: grey;
        transition: transform 0.3s; 
    }

    .folder.open::before {
        content: "📂"; 
    }

    .folder.no-items::before {
        content: ""; 
    } */
</style>