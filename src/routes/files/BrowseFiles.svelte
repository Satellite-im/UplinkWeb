<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, ChatType, FilesItemKind, Shape, Size } from "$lib/enums"
    import { Controls } from "$lib/layouts"

    import { _ } from "svelte-i18n"
    import { ImageFile, FileFolder, ProfilePicture, ProfilePictureMany } from "$lib/components"
    import { createEventDispatcher, onMount } from "svelte"
    import type { FileInfo } from "$lib/types"
    import { get, writable } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import { ConstellationStoreInstance } from "$lib/wasm/ConstellationStore"
    import { type Item } from "warp-wasm"
    import { OperationState, type Chat } from "$lib/types"
    import { Store } from "$lib/state/Store"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"

    export let activeChat: Chat
    let dispatch = createEventDispatcher()

    function onSend(filesToSend: FileInfo[]) {
        Store.state.chatAttachmentsToSend.update(files => {
            const currentChatFiles = files[activeChat.id] || { localFiles: [], storageFiles: [] }
            return {
                ...files,
                [activeChat.id]: {
                    localFiles: [...currentChatFiles.localFiles],
                    storageFiles: filesToSend,
                },
            }
        })
        dispatch("selectedFiles")
    }

    let loading: boolean = false
    $: users = Store.getUsersLookup(activeChat.users)

    $: files = Store.state.files
    let currentFolderIdStore = writable<string>("")
    let canGoBack = writable(false)

    async function openFolder(folder: FileInfo) {
        let res = await ConstellationStoreInstance.openDirectory(folder.name)
        res.fold(
            _ => {},
            _ => {
                currentFolderIdStore.set(folder.id)
                updateCurrentDirectory()
            }
        )
        ;(await ConstellationStoreInstance.canGoBack()).fold(
            _ => {},
            res => canGoBack.set(res)
        )
    }

    async function goBack() {
        let res = await ConstellationStoreInstance.goBack()
        res.fold(
            _ => {},
            id => {
                currentFolderIdStore.set(id)
                updateCurrentDirectory()
            }
        )
        ;(await ConstellationStoreInstance.canGoBack()).fold(
            _ => {},
            res => canGoBack.set(res)
        )
    }

    function itemsToFileInfo(items: Item[]): FileInfo[] {
        let filesInfo: FileInfo[] = []
        items.forEach(item => {
            let newItem: FileInfo = {
                id: item!.id(),
                type: item.is_file() ? "file" : "folder",
                icon: item.is_file() ? Shape.Document : Shape.Folder,
                name: item.is_file() ? splitFileName(item.name()).name : item!.name(),
                displayName: item.is_file() ? splitFileName(item.name()).name : item!.name(),
                size: item!.size(),
                remotePath: item!.path(),
                imageThumbnail: item.is_file() && item.thumbnail().length > 0 ? to_base64(item.thumbnail()) : undefined,
                isRenaming: OperationState.Initial,
                extension: item.is_file() ? splitFileName(item.name()).extension : "",
                source: "",
                items: item.is_file() ? undefined : itemsToFileInfo(item.directory()!.get_items()),
            }
            filesInfo = [...filesInfo, newItem]
        })
        filesInfo.sort((f1, f2) => {
            if (f1.type === f2.type) {
                return f1.name.localeCompare(f2.name)
            }
            return f2.type.localeCompare(f1.type)
        })
        return filesInfo
    }

    function splitFileName(fileName: string): { name: string; extension: string } {
        const lastDotIndex = fileName.lastIndexOf(".")
        if (lastDotIndex === -1) {
            return { name: fileName, extension: "" }
        }
        const name = fileName.substring(0, lastDotIndex)
        const extension = fileName.substring(lastDotIndex + 1)
        return { name, extension }
    }

    async function updateFilesInfo(newFilesInfo: FileInfo[]) {
        const updatedFilesInfo = await Promise.all(
            newFilesInfo.map(async element => {
                if (!element.remotePath.includes("chat_media")) {
                    return element
                }

                const chat = UIStore.getChat(element.name)
                if (chat && chat.name === "") {
                    const user = await MultipassStoreInstance.identity_from_did(chat.users[1])
                    element.displayName = user?.name ?? ""
                    element.chat = chat
                } else if (chat) {
                    element.displayName = chat?.name ?? element.name
                    element.chat = chat
                }
                return element
            })
        )

        return updatedFilesInfo
    }

    function updateFilesFromFolder(folder: FileInfo): void {
        if (folder.items && folder.items.length > 0) {
            Store.updateFileOrder(folder.items)
        }
    }

    async function updateCurrentDirectory() {
        let files = await ConstellationStoreInstance.getCurrentDirectoryFiles()
        files.onSuccess(async items => {
            let newFilesInfo = await updateFilesInfo(itemsToFileInfo(items))
            let filesSet = new Set(newFilesInfo)
            Store.updateFileOrder(Array.from(filesSet))
            $files = Array.from(filesSet)
        })
        ;(await ConstellationStoreInstance.canGoBack()).fold(
            _ => {},
            res => canGoBack.set(res)
        )
    }

    let folderClicked: FileInfo = {
        id: "",
        type: "",
        size: 0,
        icon: Shape.Folder,
        remotePath: "",
        name: "",
        displayName: "",
        source: "",
        isRenaming: OperationState.Initial,
        items: [],
    }

    onMount(async () => {
        /// HACK: This is a hack to make sure the wasm is loaded before we call the functions
        await ConstellationStoreInstance.checkLoaded()
        await ConstellationStoreInstance.getStorageFreeSpaceSize()
        await updateCurrentDirectory()

        let lastClickTime = 0
        let lastClickTarget: HTMLElement | null = null
        const dropzone = document.querySelector(".files") as HTMLElement
        dropzone.addEventListener("mousedown", event => {
            let target = event.target as HTMLElement
            while (target && !target.classList.contains("draggable-item")) {
                target = target.parentElement as HTMLElement
            }

            const currentTime = Date.now()
            if (lastClickTarget === target && currentTime - lastClickTime < 200) {
                if (lastClickTarget.classList.contains("folder-draggable")) {
                    const targetId = target.dataset.id
                    const targetFolder = $files.find(item => item.id === targetId)
                    if (targetFolder) {
                        folderClicked = targetFolder
                    }
                    if (target) {
                        const targetId = target.dataset.id
                        const targetFolder = $files.find(item => item.id === targetId)
                        if (targetFolder) {
                            updateFilesFromFolder(targetFolder)
                            openFolder(targetFolder)
                        }
                    }
                }
            }
            lastClickTarget = target
            lastClickTime = currentTime
        })
    })

    function to_base64(data: Uint8Array): string | undefined {
        const binaryString = Array.from(data)
            .map(byte => String.fromCharCode(byte))
            .join("")
        const base64String = btoa(binaryString)
        const cleanedBase64String = base64String.replace("dataimage/jpegbase64", "")
        return `data:image/jpeg;base64,${cleanedBase64String}`
    }

    let filesAlreadySelected = get(Store.state.chatAttachmentsToSend)?.[activeChat?.id]?.storageFiles || []

    let selectedItems = new Set<FileInfo>(filesAlreadySelected)

    function toggleSelect(item: FileInfo) {
        if (Array.from(selectedItems).some(selectedItem => selectedItem.remotePath === item.remotePath)) {
            selectedItems = new Set(Array.from(selectedItems).filter(selectedItem => selectedItem.remotePath !== item.remotePath))
        } else {
            selectedItems.add(item)
        }
        selectedItems = new Set(selectedItems)
    }

    function isSelected(item: FileInfo) {
        return Array.from(selectedItems).some(selectedItem => selectedItem.remotePath === item.remotePath)
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="page" on:dragover|preventDefault>
    <div class="content">
        {#if $canGoBack}
            <div class="folder-back">
                <Button hook="button-folder-back" small appearance={Appearance.Alt} class="folder-back" on:click={goBack}>{$_("controls.go_back")}</Button>
            </div>
        {/if}
        <div class="files">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each $files as item}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                {#key item.id && Array.from(selectedItems).some(selectedItem => selectedItem.remotePath === item.remotePath)}
                    <div class="draggable-item {item.id} {item.type === 'folder' ? 'folder-draggable droppable' : ''}" draggable="true" data-id={item.id}>
                        {#if item.type === "file"}
                            <div class="item-with-checkbox" role="button" tabindex="0" on:click={() => toggleSelect(item)}>
                                <div class="file-item">
                                    <input type="checkbox" checked={isSelected(item)} />
                                </div>
                                <FileFolder
                                    itemId={item.id}
                                    avoidOpenImageModal={true}
                                    hook="file-{item.name}"
                                    onRename={async _ => {
                                        return false
                                    }}
                                    isRenaming={item.isRenaming}
                                    kind={item.imageThumbnail ? FilesItemKind.Image : FilesItemKind.File}
                                    info={item} />
                            </div>
                        {:else if item.type === "folder"}
                            {#if item.chat}
                                {#if item.chat.kind === ChatType.DirectMessage}
                                    <div class="profile-picture-folder">
                                        <ProfilePicture
                                            hook="chat-topbar-profile-picture"
                                            typing={item.chat.typing_indicator.size > 0}
                                            id={$users[item.chat.users[1]]?.key}
                                            image={$users[item.chat.users[1]]?.profile.photo.image}
                                            frame={$users[item.chat.users[1]]?.profile.photo.frame}
                                            size={Size.Smaller}
                                            noIndicator={true}
                                            loading={loading} />
                                    </div>
                                {:else}
                                    <div class="profile-picture-many-folder">
                                        <ProfilePictureMany users={Object.values($users)} size={Size.Smaller} forceSize={true} />
                                    </div>
                                {/if}
                            {/if}
                            <FileFolder
                                itemId={item.id}
                                hook="folder-{item.name}"
                                kind={FilesItemKind.Folder}
                                info={item}
                                onRename={async _ => {
                                    return false
                                }}
                                isRenaming={item.isRenaming} />
                        {:else if item.type === "image"}
                            <ImageFile filesize={item.size} name={item.name} ImgSource={item.source} on:click={_ => {}} />
                        {/if}
                    </div>
                {/key}
            {/each}
        </div>
        <Controls>
            <Button
                hook="button-select_files"
                tooltip="Send"
                text="Send Selected"
                appearance={Appearance.Default}
                loading={loading}
                on:click={_ => {
                    onSend(Array.from(selectedItems))
                }}>
                <Icon icon={Shape.ArrowRight} />
            </Button>
        </Controls>
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;

        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            animation: fadeIn 0.3s forwards;

            &.fade-out {
                animation: fadeOut 0.3s backwards;
            }
        }

        .upload-box {
            background: var(--primary-color);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform: scale(0.5);
            animation: scaleUp 0.3s forwards;
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }

        @keyframes fadeOut {
            to {
                opacity: 0;
            }
        }

        @keyframes scaleUp {
            to {
                transform: scale(1);
            }
        }

        .stat {
            padding: 0 var(--padding-less);
            border-radius: var(--border-radius-minimal);
            border: var(--border-width) solid transparent;
            background-color: transparent;
            transition: all var(--animation-speed);
            &:hover {
                background-color: var(--alt-color);
                border: var(--border-width) solid var(--primary-color);
                user-select: none;
            }
        }
        .folder-back {
            width: fit-content;
            margin: 10px;
        }
        .folderList {
            margin-left: -20px;
        }

        .item-with-checkbox:hover {
            border: 1px solid var(--primary-color);
            cursor: pointer;
        }

        .file-item {
            position: absolute;
            top: 5px;
            left: 15px;
        }

        .content {
            display: flex;
            min-height: 0;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
            width: 100%;

            .before {
                gap: var(--gap-less);
                width: 100%;

                .actions {
                    width: 100%;
                    overflow-x: scroll;
                    overflow-y: hidden;
                    display: inline-flex;
                    flex-wrap: nowrap;
                    gap: var(--gap-less);
                    height: calc(var(--input-height) + var(--padding));
                    padding-bottom: var(--padding-less);
                }
            }

            .files {
                height: 100%;
                width: 100%;
                display: inline-flex;
                flex-direction: row;
                flex-wrap: wrap;
                align-content: flex-start;
                overflow-y: scroll;
                padding: 1rem;

                .draggable-item {
                    position: relative;
                    height: fit-content;
                }
            }
        }

        .upload-file-count-container {
            display: flex;
            height: 90px;
            width: 100%;
            align-items: center;
            background: var(--opaque-color);
            border-bottom: var(--border-width) solid var(--border-color);
            .upload-file-count {
                color: var(--text-color-muted);
                padding-left: 24px;
            }
        }

        .profile-picture-folder {
            position: absolute;
            height: 10px;
            width: 10px;
            top: 40px;
            left: 70px;
            pointer-events: none;
            z-index: 1;
        }

        .profile-picture-many-folder {
            position: absolute;
            height: 10px;
            width: 10px;
            top: 20px;
            left: 70px;
            pointer-events: none;
            z-index: 1;
        }
    }
</style>
