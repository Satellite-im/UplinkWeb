<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, ChatType, FilesItemKind, Route, Shape, Size } from "$lib/enums"
    import { Topbar } from "$lib/layouts"

    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import { _ } from "svelte-i18n"
    import Text from "$lib/elements/Text.svelte"
    import Label from "$lib/elements/Label.svelte"
    import prettyBytes from "pretty-bytes"
    import { ChatPreview, ImageEmbed, ImageFile, Modal, FileFolder, ProgressButton, ContextMenu, ChatFilter, ProfilePicture, ProfilePictureMany } from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { onMount } from "svelte"
    import type { FileInfo, User } from "$lib/types"
    import { writable, readable } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import FolderItem from "./FolderItem.svelte"
    import { v4 as uuidv4 } from "uuid"
    import { goto } from "$app/navigation"
    import { ConstellationStoreInstance } from "$lib/wasm/ConstellationStore"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { type Item } from "warp-wasm"
    import { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { OperationState } from "$lib/types"
    import { Store } from "$lib/state/Store"
    import path from "path"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"

    export let browseFilesForChatMode: boolean = false

    let loading: boolean = false
    $: sidebarOpen = UIStore.state.sidebarOpen
    let isContextMenuOpen: boolean = false
    let isDraggingFromLocal = false
    let filesCount = 0
    $: isFadingOutDragDropOverlay = false
    $: users = Store.getUsersLookup($activeChat.users)

    function toggleSidebar(): void {
        UIStore.toggleSidebar()
    }

    let tabRoutes: string[] = ["chats", "files"]
    let activeTabRoute: string = tabRoutes[1]
    $: openFolders = Store.state.openFolders
    function toggleFolder(folderId: string | number) {
        const currentOpenFolders = $openFolders
        const updatedOpenFolders = {
            ...currentOpenFolders,
            [folderId]: !currentOpenFolders[folderId],
        }
        Store.updateFolderTree(updatedOpenFolders)
    }

    let dragging_files = 0
    let previewImage: string | null
    let search_filter: string
    let search_component: ChatFilter
    let filesToUpload: HTMLInputElement
    $: files = Store.state.files
    let currentFolderIdStore = writable<string>("")
    let rename: string | undefined
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

    async function createNewDirectory(folder: FileInfo) {
        folder.isRenaming = OperationState.Success
        if (folder.name === "") {
            updateCurrentDirectory()
            folder.isRenaming = OperationState.Error
            return
        }
        let newDirCreated = await ConstellationStoreInstance.createDirectory(folder.name)
        newDirCreated.fold(
            err => {
                folder.isRenaming = OperationState.Error
                if (err === WarpError.DIRECTORY_ALREADY_EXIST) {
                    updateCurrentDirectory()
                    Store.addToastNotification(new ToastMessage("", $_("files.itemAlreadyExistsWithSameName"), 2))
                    return
                }
                updateCurrentDirectory()
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            async _ => {
                updateCurrentDirectory()
            }
        )
    }

    function newFolder() {
        let createNewFolder: FileInfo = {
            id: uuidv4(),
            type: "folder",
            size: 0,
            icon: Shape.Folder,
            remotePath: "",
            name: "",
            displayName: "",
            source: "",
            extension: "",
            isRenaming: OperationState.Loading,
            items: [],
            parentId: $currentFolderIdStore,
        }
        $files = [...$files, createNewFolder]
        rename = createNewFolder.id
    }

    function dropItemIntoFolder(droppingItem: FileInfo, target: string) {
        function findFolderAndInsert(targetId: string, item: FileInfo, folders: FileInfo[]) {
            let target = folders.find(target => target.id === targetId && target.type === "folder")
            if (target) {
                if (item.type === "folder") {
                    ConstellationStoreInstance.dropIntoFolder(item.name, target.name)
                } else {
                    ConstellationStoreInstance.dropIntoFolder(`${item.name}.${item.extension}`, target.name)
                }
            }
        }
        ;("")
        findFolderAndInsert(target, droppingItem, $files)
        updateCurrentDirectory()
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
    function updateFilesFromFolder(folder: FileInfo): void {
        if (folder.items && folder.items.length > 0) {
            Store.updateFileOrder(folder.items)
        }
    }

    $: freeSpace = ConstellationStoreInstance.freeStorageSpace

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
        let draggedItemId: string | null = ""
        let draggedElement: HTMLElement | null = null
        let targetFolderId: string | null = null
        document.addEventListener("dragstart", (event: DragEvent) => {
            draggedElement = (event.target as HTMLElement).closest(".draggable-item")
        })
        document.addEventListener("dragover", (event: DragEvent) => {
            event.preventDefault()
        })
        document.addEventListener("drop", (event: DragEvent) => {
            event.preventDefault()
            const dropTargetElement = (event.target as HTMLElement).closest(".draggable-item")
            if (dropTargetElement && draggedElement) {
                targetFolderId = dropTargetElement.getAttribute("data-id")
                const dragId = draggedElement.getAttribute("data-id")
                const draggedItem = $files.find(item => item.id === dragId)
                if (draggedElement) {
                    draggedItemId = draggedElement.getAttribute("data-id")
                    if (targetFolderId && draggedItem) {
                        if (targetFolderId !== draggedItem.id) {
                            draggedItem.parentId = targetFolderId
                            dropItemIntoFolder(draggedItem, targetFolderId)
                        }
                    }
                }
                draggedElement = null
            }
        })
    })

    function dragEnter(event: DragEvent) {
        event.preventDefault()
        dragging_files++
        isDraggingFromLocal = true
        filesCount = event.dataTransfer?.items.length || 0
        isFadingOutDragDropOverlay = false
    }

    function dragLeave(event: DragEvent) {
        event.preventDefault()
        dragging_files--
        if (dragging_files === 0) {
            isDraggingFromLocal = false
            isFadingOutDragDropOverlay = true
            setTimeout(() => {
                isFadingOutDragDropOverlay = false
            }, 300)
        }
    }

    async function dragDrop(event: DragEvent) {
        event.preventDefault()
        const dropTargetElement = (event.target as HTMLElement).closest(".draggable-item")
        if (dropTargetElement) return
        dragging_files = 0
        isFadingOutDragDropOverlay = true
        let filesToUpload = event.dataTransfer?.files
        isDraggingFromLocal = false
        filesCount = 0
        if (filesToUpload) {
            filesCount = filesToUpload.length
            for (let i = 0; i < filesCount; i++) {
                let file = filesToUpload[i]
                const stream = file.stream()
                const fileNameParts = file.name.split(".")
                const baseName = fileNameParts.slice(0, -1).join(".")
                const fileExtension = fileNameParts.slice(-1)[0]
                let newFileName = file.name
                let fileIndex = 1

                $files.forEach(fileUploaded => {
                    if (`${fileUploaded.name}.${fileUploaded.extension}` === newFileName) {
                        newFileName = `${baseName} (${fileIndex}).${fileExtension}`
                        fileIndex++
                    }
                })
                await uploadFilesFromDrop(newFileName, stream, file.size)
            }
        }
        updateCurrentDirectory()
        setTimeout(() => {
            isFadingOutDragDropOverlay = false
        }, 300)
    }

    async function uploadFilesFromDrop(name: string, stream: ReadableStream, size: number) {
        let result = await ConstellationStoreInstance.uploadFilesFromStream(name, stream, size)
        result.onFailure(err => {
            Store.addToastNotification(new ToastMessage("", err, 3, Shape.XMark, Appearance.Error))
        })
    }

    function onSearchEnter() {
        goto(Route.Chat)
        search_component.select_first()
    }

    const onFileSelected = async (e: Event) => {
        const target = e.target as HTMLInputElement
        if (target && target.files) {
            for (let i = 0; i < target.files.length; i++) {
                const file = target.files[i]
                const stream = file.stream()
                const fileNameParts = file.name.split(".")
                const baseName = fileNameParts.slice(0, -1).join(".")
                const extension = fileNameParts.slice(-1)[0]
                let newFileName = file.name
                let fileIndex = 1
                $files.forEach(fileUploaded => {
                    if (`${fileUploaded.name}.${fileUploaded.extension}` === newFileName) {
                        newFileName = `${baseName} (${fileIndex}).${extension}`
                        fileIndex++
                    }
                })
                let result = await ConstellationStoreInstance.uploadFilesFromStream(newFileName, stream, file.size)
                result.onFailure(err => {
                    Store.addToastNotification(new ToastMessage("", err, 3, Shape.XMark, Appearance.Error))
                })
            }
        }
        target.value = ""
        updateCurrentDirectory()
    }

    async function deleteItem(file_name: string) {
        let result = await ConstellationStoreInstance.deleteItem(file_name)
        result.fold(
            err => {
                // TODO(Lucas): Error not mapped yet
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            _ => {
                updateCurrentDirectory()
                Store.addToastNotification(new ToastMessage("", `Successfully deleted item "${file_name}"`, 2))
            }
        )
    }

    async function renameItem(item: FileInfo, newName: string, fileExtension: string = "") {
        newName = newName.trim()
        let oldName = item.name
        if (item.type === "folder" && oldName.trim() === "" && newName === "") {
            return false
        }
        if (oldName.trim() === newName) {
            return false
        }
        if (newName === "") {
            Store.addToastNotification(new ToastMessage("", "Empty name provided", 2))
            return false
        }
        let result = await ConstellationStoreInstance.renameItem(fileExtension === "" ? `${oldName}` : `${oldName}.${fileExtension}`, fileExtension === "" ? `${newName}` : `${newName}.${fileExtension}`)
        result.fold(
            err => {
                item.isRenaming = OperationState.Error
                if (err === WarpError.ITEM_ALREADY_EXIST_WITH_SAME_NAME) {
                    updateCurrentDirectory()
                    Store.addToastNotification(new ToastMessage("", `Other item already exists with this name`, 2))
                    return
                }
                updateCurrentDirectory()
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            _ => {
                item.isRenaming = OperationState.Success
                Store.addToastNotification(new ToastMessage("", `Successfully renamed "${oldName}" to "${newName}"`, 2))
                updateCurrentDirectory()
            }
        )
        return true
    }

    async function downloadFile(fileName: string) {
        let result = await ConstellationStoreInstance.downloadFile(fileName)
        result.fold(
            err => {
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = path.basename(fileName)
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }
        )
    }

    $: chats = UIStore.state.chats
    $: activeChat = Store.state.activeChat

    function to_base64(data: Uint8Array): string | undefined {
        const binaryString = Array.from(data)
            .map(byte => String.fromCharCode(byte))
            .join("")
        const base64String = btoa(binaryString)
        const cleanedBase64String = base64String.replace("dataimage/jpegbase64", "")
        return `data:image/jpeg;base64,${cleanedBase64String}`
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    id="page"
    on:dragover|preventDefault
    on:dragenter={e => {
        dragEnter(e)
    }}
    on:dragleave={dragLeave}
    on:drop={e => {
        dragDrop(e)
    }}>
    <!-- {#if isDraggingFromLocal || isFadingOutDragDropOverlay}
        <div class="overlay {isFadingOutDragDropOverlay ? 'fade-out' : ''}">
            <div class="upload-box">
                <p>{filesCount > 1 ? $_("files.dragging_files").replace("{count}", filesCount.toString()) : $_("files.dragging_file")}</p>
            </div>
        </div>
    {/if} -->
    <!-- Modals -->
    {#if previewImage}
        <Modal
            hook="preview-image-modal"
            on:close={_ => {
                previewImage = null
            }}>
            <svelte:fragment slot="controls">
                <Button
                    hook="button-close-preview-image-modal"
                    icon
                    small
                    appearance={Appearance.Alt}
                    on:click={_ => {
                        previewImage = null
                    }}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}

    {#if !browseFilesForChatMode}
        <Sidebar loading={loading} on:toggle={toggleSidebar} open={$sidebarOpen} activeRoute={Route.Files} bind:search={search_filter} on:search={() => search_component.filter_chat()} on:enter={onSearchEnter}>
            <ChatFilter bind:this={search_component} bind:filter={search_filter}></ChatFilter>
            <Controls>
                <Button
                    appearance={activeTabRoute === "chats" ? Appearance.Primary : Appearance.Alt}
                    hook="button-sidebar-chats"
                    text={$_("chat.chat_plural")}
                    on:click={_ => {
                        activeTabRoute = "chats"
                    }}>
                    <Icon icon={Shape.ChatBubble} />
                </Button>
                <Button
                    appearance={activeTabRoute === "files" ? Appearance.Primary : Appearance.Alt}
                    hook="button-sidebar-files"
                    text={$_("files.file_plural")}
                    on:click={_ => {
                        activeTabRoute = "files"
                    }}>
                    <Icon icon={Shape.Folder} />
                </Button>
            </Controls>
            {#if activeTabRoute === "chats"}
                {#each $chats.slice().sort((a, b) => {
                    const dateA = new Date(a.last_message_at || 0)
                    const dateB = new Date(b.last_message_at || 0)
                    return dateB.getTime() - dateA.getTime()
                }) as chat}
                    <ContextMenu
                        hook="context-menu-sidebar-chat"
                        items={[
                            {
                                id: "hide",
                                icon: Shape.EyeSlash,
                                text: $_("chat.hide"),
                                appearance: Appearance.Default,
                                onClick: () => UIStore.removeSidebarChat(chat),
                            },
                            {
                                id: "mark_read",
                                icon: Shape.CheckMark,
                                text: $_("chat.markRead"),
                                appearance: Appearance.Default,
                                onClick: () => {},
                            },
                        ]}>
                        <ChatPreview slot="content" let:open on:contextmenu={open} chat={chat} loading={loading} cta={$activeChat === chat} />
                    </ContextMenu>
                {/each}
            {/if}
            {#if activeTabRoute === "files"}
                <ul class="folderList" data-cy="folder-list">
                    {#each $files as file}
                        <FolderItem file={file} openFolders={$openFolders} toggleFolder={toggleFolder} />
                    {/each}
                </ul>
            {/if}
        </Sidebar>
    {/if}
    <div class="content">
        <!-- <Topbar>
            <div slot="before" class="before flex-column">
                <Label hook="label-quick-actions" text={$_("files.quickActions")} />
                <div class="actions">
                    <Button hook="button-files-sync" appearance={Appearance.Alt} text={$_("files.sync")}>
                        <Icon icon={Shape.ArrowsLeftRight} />
                    </Button>
                    <Button hook="button-files-gift-space" appearance={Appearance.Alt} text={$_("files.giftSpace")}>
                        <Icon icon={Shape.Gift} />
                    </Button>
                    <Button hook="button-files-rent-space" appearance={Appearance.Alt} text={$_("files.rentSpace")}>
                        <Icon size={Size.Large} icon={Shape.Starlight} />
                    </Button>
                    <Button hook="button-files-create-node" appearance={Appearance.Alt} text={$_("files.createNode")}>
                        <Icon icon={Shape.Info} />
                    </Button>
                </div>
            </div>
        </Topbar> -->
        <Topbar>
            <div slot="before" class="before">
                <button class="stat">
                    <Label hook="label-files-free-space" text={$_("files.freeSpace")} /><Text hook="text-files-free-space" singleLine>
                        {$freeSpace}
                    </Text>
                </button>
                <button class="stat">
                    <Label hook="label-files-total-space" text={$_("files.totalSpace")} /><Text hook="text-files-total-space" singleLine>
                        {prettyBytes(ConstellationStoreInstance.MAX_STORAGE_SIZE)}
                    </Text>
                </button>
            </div>
            <svelte:fragment slot="controls">
                {#if !browseFilesForChatMode}
                    <Button hook="button-new-folder" appearance={Appearance.Alt} on:click={newFolder} icon tooltip={$_("files.new_folder")}>
                        <Icon icon={Shape.FolderPlus} />
                    </Button>
                    <Button
                        appearance={Appearance.Alt}
                        hook="button-upload-file"
                        icon
                        tooltip={$_("files.upload")}
                        on:click={async () => {
                            filesToUpload?.click()
                        }}>
                        <Icon icon={Shape.Plus} />
                    </Button>
                    <input data-cy="input=upload-files" style="display:none" multiple type="file" on:change={e => onFileSelected(e)} bind:this={filesToUpload} />
                    <ProgressButton appearance={Appearance.Alt} icon={Shape.ArrowsUpDown} />
                {/if}
            </svelte:fragment>
        </Topbar>
        {#if $canGoBack}
            <div class="folder-back">
                <Button hook="button-folder-back" small appearance={Appearance.Alt} class="folder-back" on:click={goBack}>{$_("controls.go_back")}</Button>
            </div>
        {/if}
        <div class="files">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each $files as item}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                {#key item}
                    <div class="draggable-item {item.id} {item.type === 'folder' ? 'folder-draggable droppable' : ''}" draggable="true" data-id={item.id}>
                        {#if item.type === "file"}
                            <ContextMenu
                                hook="context-menu-file"
                                on:close={_ => {
                                    isContextMenuOpen = false
                                }}
                                items={[
                                    {
                                        id: `rename-${item.id}`,
                                        icon: Shape.Pencil,
                                        text: $_("files.rename"),
                                        appearance: Appearance.Default,
                                        onClick: async () => {
                                            $files = $files.map(file => {
                                                if (file.id === item.id) {
                                                    file.isRenaming = OperationState.Loading
                                                } else {
                                                    file.isRenaming = OperationState.Initial
                                                }
                                                return file
                                            })
                                        },
                                    },
                                    {
                                        id: "download-" + item.id,
                                        icon: Shape.ArrowDown,
                                        text: $_("files.download"),
                                        appearance: Appearance.Default,
                                        onClick: async () => {
                                            downloadFile(`/${item.name}.${item.extension}`)
                                        },
                                    },
                                    {
                                        id: "delete-" + item.id,
                                        icon: Shape.Trash,
                                        text: $_("generic.delete"),
                                        appearance: Appearance.Error,
                                        onClick: () => {
                                            deleteItem(`/${item.name}.${item.extension}`)
                                        },
                                    },
                                ]}>
                                <FileFolder
                                    itemId={item.id}
                                    hook="file-{item.name}"
                                    slot="content"
                                    let:open
                                    on:contextmenu={e => {
                                        isContextMenuOpen = true
                                        open(e)
                                    }}
                                    onRename={async (name, cancel) => {
                                        rename = undefined
                                        if (cancel) return false
                                        return renameItem(item, `${name}`, `${item.extension}`)
                                    }}
                                    isRenaming={item.isRenaming}
                                    kind={item.imageThumbnail ? FilesItemKind.Image : FilesItemKind.File}
                                    info={item} />
                            </ContextMenu>
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
                            <ContextMenu
                                hook="context-menu-folder"
                                on:close={_ => {
                                    isContextMenuOpen = false
                                }}
                                items={[
                                    {
                                        id: "delete-" + item.id,
                                        icon: Shape.XMark,
                                        text: $_("generic.delete"),
                                        appearance: Appearance.Default,
                                        onClick: () => {
                                            deleteItem(`/${item.name}/`)
                                        },
                                    },
                                    {
                                        id: "rename-" + item.id,
                                        icon: Shape.Pencil,
                                        text: $_("files.rename"),
                                        appearance: Appearance.Default,
                                        onClick: async () => {
                                            $files = $files.map(file => {
                                                if (file.id === item.id) {
                                                    file.isRenaming = OperationState.Loading
                                                } else {
                                                    file.isRenaming = OperationState.Initial
                                                }
                                                return file
                                            })
                                        },
                                    },
                                ]}>
                                <FileFolder
                                    itemId={item.id}
                                    hook="folder-{item.name}"
                                    slot="content"
                                    let:open
                                    on:contextmenu={e => {
                                        isContextMenuOpen = true
                                        open(e)
                                    }}
                                    kind={FilesItemKind.Folder}
                                    info={item}
                                    onRename={async (name, cancel) => {
                                        if (cancel) {
                                            updateCurrentDirectory()
                                            return false
                                        }
                                        rename = undefined
                                        if (item.name.trim() === "") {
                                            const newName = `${name}`
                                            item.name = newName
                                            await createNewDirectory(item)
                                            return true
                                        } else {
                                            return renameItem(item, `${name}`)
                                        }
                                    }}
                                    isRenaming={item.isRenaming} />
                            </ContextMenu>
                        {:else if item.type === "image"}
                            <ImageFile
                                filesize={item.size}
                                name={item.name}
                                ImgSource={item.source}
                                on:click={_ => {
                                    previewImage = item.source
                                }} />
                        {/if}
                    </div>
                {/key}
            {/each}
        </div>
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
