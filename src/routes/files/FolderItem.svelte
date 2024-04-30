<script>
// @ts-nocheck

    export let file;
    export let openFolders;
    export let toggleFolder;

    function createClickHandler(file, isChild) {
        return function(event) {
            event.stopPropagation(); // Stop event propagation
            if (!isChild || !openFolders[file.id]) {
            console.log(file, event)
                toggleFolder(file.id);
            }
            if (!isChild || !openFolders[file.id]) {
            console.log(file, event)
                toggleFolder(file.id);
            }
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
                <li on:click={createClickHandler(item, true)}>{item.name}</li>
            {/each}
        </ul>
    {/if}
</li>