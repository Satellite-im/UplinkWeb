<script lang="ts">
    import { Icon, Text, Spacer } from "$lib/elements"
    import { FilesItemKind, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/store"
    import type { FileInfo } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { createEventDispatcher, onMount } from "svelte"

    export let kind: FilesItemKind = FilesItemKind.File
    export let info: FileInfo
    export let name = info.name

   export let isEditing = false
    let inputRef: HTMLInputElement
    const dispatch = createEventDispatcher()
    let isEnterKeyPressed: boolean = false

    function getIcon() {
        switch (kind) {
            case FilesItemKind.File:
                return Shape.Document
            case FilesItemKind.Folder:
                return Shape.Folder
            case FilesItemKind.Image:
                return Shape.Beaker
        }
    }
    let storeFiles = Store.state.files
    function updateName(
        event: Event & {
            currentTarget: EventTarget & HTMLInputElement
        }
    ) {
        const input = event.target as HTMLInputElement
        name = input.value
        storeFiles.update(items => {
            const updatedItems = items.map(item => {
                if (item.id === info.id) {
                    return { ...item, name: name }
                }
                return item
            })
            return updatedItems
        })
    }

    function onRename() {
        dispatch("rename", name)
        isEditing = false
    }

    onMount(() => {
        if (inputRef) {
            inputRef.focus()
        }
    })

</script>

<section>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="filesitem" on:contextmenu>
        <Icon icon={getIcon()} />
        <Spacer less />
        {#if isEditing}
            <input 
                type="text" 
                bind:value={name} 
                on:input={updateName} 
                on:blur={() => {
                    if (!isEnterKeyPressed)
                        {onRename()}
                    isEnterKeyPressed = false
                }} 
                on:keydown={(e) => {
                    if (e.key === 'Escape')
                        {name = ""}
                    if (e.key === 'Enter' || e.key === 'Escape')
                        {
                            isEnterKeyPressed = true
                            onRename()
                        }
                    }}
                bind:this={inputRef}
            />
        {:else}
            <div class="ellipsis">
                {name}
            </div>
        {/if}
        <!-- <input type="text" bind:value={name} on:input={updateName} /> -->
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


    .ellipsis {
            white-space: nowrap; 
            overflow: hidden;   
            text-overflow: ellipsis; 
            width: 120px;
            text-align: center;
    }
</style>
