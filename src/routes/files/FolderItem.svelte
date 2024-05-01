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
<li on:click={createClickHandler(file, false)}>
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