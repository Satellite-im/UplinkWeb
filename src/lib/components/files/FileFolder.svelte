<script lang="ts">
	import { doubleLine } from './../../../../.svelte-kit/output/server/chunks/UnderConstruction.svelte_svelte_type_style_lang.js';
    import { Icon, Text, Spacer } from "$lib/elements"
    import { FilesItemKind, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/store"
    import type { FileInfo } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { createEventDispatcher, onMount } from "svelte"
    import { State } from './state';



    export let itemId: string
    export let kind: FilesItemKind = FilesItemKind.File
    export let info: FileInfo
    export let name = info.name
    export let isRenaming: State = State.Initial
    let hasFocus = false
    let oldName = name

    $: if (isRenaming !== State.Loading) {
        hasFocus = false
    }

    $: if (isRenaming === State.Success) {
        oldName = name
        storeFiles.update(items => {
            const updatedItems = items.map(item => {
                if (item.id === info.id) {
                    return { ...item, name: name }
                }
                return item
            })
            return updatedItems
        })
        isRenaming = State.Initial
    } else if (isRenaming === State.Error) {
        name = oldName
        isRenaming = State.Initial
    } else if (isRenaming === State.Loading && !hasFocus) {
        if (inputRef) {
            inputRef.focus()
            hasFocus = true
            inputRef.setSelectionRange(0, inputRef.value.length);
        }
    }

    let inputRef: HTMLInputElement
    const dispatch = createEventDispatcher()
    let isEnterOrEscapeKeyPressed: boolean = false

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
    }

    function onRename() {
        dispatch("rename", name)
        isRenaming = State.Initial
    }

    onMount(() => {
        if (inputRef) {
            inputRef.focus()
        }
    })

    function onKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape')
            {
                isEnterOrEscapeKeyPressed = true
                isRenaming = State.Initial
                name = oldName
                return}
        if (event.key === 'Enter')
            {
                isEnterOrEscapeKeyPressed = true
                if (name === "" || name === oldName)
                {
                    name = oldName
                    isRenaming = State.Initial
                    return
                }
                onRename()
            }
    }

    function onBlur() {
        if (name === "" || name === oldName)
            {
                name = oldName
                isRenaming = State.Initial
            }
        else if (!isEnterOrEscapeKeyPressed)
            {onRename()}
        isEnterOrEscapeKeyPressed = false
    }

</script>

<section>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="filesitem" on:contextmenu>
        <Icon icon={getIcon()} />
        <Spacer less />
        {#if isRenaming === State.Loading}
            <input 
                id="input-{itemId}"
                type="text" 
                bind:value={name} 
                on:input={updateName} 
                on:blur={onBlur} 
                on:keydown={onKeydown}
                bind:this={inputRef}
            />
        {:else}
            <Text>
                {name}{info?.extension && `.${info.extension}`}
            </Text>
        {/if}
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
