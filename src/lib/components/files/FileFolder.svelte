<script lang="ts">
    import { Icon, Text, Spacer } from "$lib/elements"
    import { FilesItemKind, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { FileInfo } from "$lib/types"
    import { OperationState } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { createEventDispatcher, onMount } from "svelte"

    export let itemId: string
    export let kind: FilesItemKind = FilesItemKind.File
    export let info: FileInfo
    export let name = info.name
    export let isRenaming: OperationState = OperationState.Initial
    export let hook: string = ""
    let hasFocus = false
    let oldName = name

    $: if (isRenaming !== OperationState.Loading) {
        hasFocus = false
    }

    $: if (isRenaming === OperationState.Success) {
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
        isRenaming = OperationState.Initial
    } else if (isRenaming === OperationState.Error) {
        name = oldName
        isRenaming = OperationState.Initial
    } else if (isRenaming === OperationState.Loading && !hasFocus) {
        if (inputRef) {
            inputRef.focus()
            hasFocus = true
            inputRef.setSelectionRange(0, inputRef.value.length)
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
        isRenaming = OperationState.Initial
    }

    onMount(() => {
        if (inputRef) {
            inputRef.focus()
        }
    })

    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            isEnterOrEscapeKeyPressed = true
            isRenaming = OperationState.Initial
            name = oldName
            return
        }
        if (event.key === "Enter") {
            isEnterOrEscapeKeyPressed = true
            if (name === "" || name === oldName) {
                name = oldName
                isRenaming = OperationState.Initial
                return
            }
            onRename()
        }
    }

    function onBlur() {
        if (name === "" || name === oldName) {
            name = oldName
            isRenaming = OperationState.Initial
        } else if (!isEnterOrEscapeKeyPressed) {
            onRename()
        }
        isEnterOrEscapeKeyPressed = false
    }
</script>

<section>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div data-cy={hook} class="filesitem" on:contextmenu>
        <Icon icon={getIcon()} />
        <Spacer less />
        {#if isRenaming === OperationState.Loading}
            <input data-cy="input-file-folder-name" id="input-{itemId}" type="text" bind:value={name} on:input={updateName} on:blur={onBlur} on:keydown={onKeydown} bind:this={inputRef} />
        {:else}
            <Text hook="file-folder-name" class="name">
                {name}{info?.extension && `.${info.extension}`}
            </Text>
        {/if}
        <Text hook="file-folder-size" size={Size.Smallest} muted>{prettyBytes(info?.size)}</Text>
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
        white-space: nowrap;
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

        :global(.name) {
            overflow: hidden;
            max-width: 100%;
            text-overflow: ellipsis;
            line-clamp: 1;
        }
    }
</style>
