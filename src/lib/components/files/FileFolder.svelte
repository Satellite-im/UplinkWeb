<script lang="ts">
    import { Icon, Text, Spacer } from "$lib/elements"
    import { FilesItemKind, Shape, Size } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import type { FileInfo } from "$lib/types"
    import { OperationState } from "$lib/types"
    import prettyBytes from "pretty-bytes"
    import { createEventDispatcher, onMount } from "svelte"
    import Modal from "../ui/Modal.svelte"

    export let itemId: string
    export let kind: FilesItemKind = FilesItemKind.File
    export let info: FileInfo
    export let name = info.displayName
    export let isRenaming: OperationState = OperationState.Initial
    export let hook: string = ""
    export let avoidOpenImageModal: boolean = false
    export let onRename: (name: string, cancel: boolean) => Promise<boolean> = _ => Promise.resolve(true)
    let hasFocus = false
    let oldName = name

    let openImageModal = false

    $: if (isRenaming !== OperationState.Loading) {
        hasFocus = false
    }

    $: if (isRenaming === OperationState.Success) {
        hasFocus = false
        oldName = name
        isRenaming = OperationState.Initial
    } else if (isRenaming === OperationState.Error) {
        hasFocus = false
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
    function updateName(
        event: Event & {
            currentTarget: EventTarget & HTMLInputElement
        }
    ) {
        const input = event.target as HTMLInputElement
        name = input.value
    }

    onMount(() => {
        if (inputRef) {
            inputRef.focus()
        }
    })

    async function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            isEnterOrEscapeKeyPressed = true
            await onRename(name, true)
            isRenaming = OperationState.Initial
            return
        }
        if (event.key === "Enter") {
            isEnterOrEscapeKeyPressed = true
            let rename = await onRename(name, false)
            if (!rename) {
                name = oldName
                isRenaming = OperationState.Initial
                return
            }
            isRenaming = OperationState.Initial
        }
    }

    async function onBlur() {
        if (!isEnterOrEscapeKeyPressed) {
            let rename = await onRename(name, isEnterOrEscapeKeyPressed)
            if (!rename) {
                name = oldName
            }
        }
        isRenaming = OperationState.Initial
        isEnterOrEscapeKeyPressed = false
    }

    function onCloseModal() {
        openImageModal = false
    }
</script>

<section>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        data-cy={hook}
        class="filesitem"
        on:contextmenu
        on:click={_ => {
            if (kind === FilesItemKind.Image && info?.imageThumbnail) {
                openImageModal = true
            }
        }}>
        {#if kind === FilesItemKind.Image && info?.imageThumbnail}
            <img data-cy="file-preview-image" class="img-preview-on-storage" src={info.imageThumbnail} alt={name} />
        {:else}
            <Icon icon={getIcon()} />
        {/if}
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

{#if openImageModal && !avoidOpenImageModal}
    <Modal on:close={onCloseModal}>
        <img class="img-preview-on-storage-on-modal" src={info.imageThumbnail} alt={name} />
    </Modal>
{/if}

<style lang="scss">
    .img-preview-on-storage-on-modal {
        width: 100%;
        max-height: 100%;
        object-fit: cover;
    }
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
        background-color: transparent;

        &:hover {
            background: var(--background-alt);
        }
        .img-preview-on-storage {
            max-width: 100px;
            max-height: 50%;
            object-fit: cover;
            margin-bottom: 8px;
            border-radius: 4px;
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
