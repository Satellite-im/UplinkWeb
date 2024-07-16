<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, FilesItemKind, Route, Shape } from "$lib/enums"
    import { Topbar } from "$lib/layouts"
    import { initLocale } from "$lib/lang"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import { _ } from "svelte-i18n"
    import Text from "$lib/elements/Text.svelte"
    import Label from "$lib/elements/Label.svelte"
    import prettyBytes from "pretty-bytes"
    import { ChatPreview, ImageEmbed, ImageFile, Modal, FileFolder, ProgressButton, ContextMenu, ChatFilter } from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Plugins } from "@shopify/draggable"
    import { onDestroy, onMount } from "svelte"
    import { Sortable } from "@shopify/draggable"
    import type { Chat, FileInfo } from "$lib/types"
    import { get, writable } from "svelte/store"
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import FolderItem from "./FolderItem.svelte"
    import { v4 as uuidv4 } from "uuid"
    import { goto } from "$app/navigation"
    import { ConstellationStoreInstance } from "$lib/wasm/ConstellationStore"
    import { ToastMessage } from "$lib/state/ui/toast"
    import type { Item } from "warp-wasm"
    import { WarpError } from "$lib/wasm/HandleWarpErrors"
    import { OperationState } from "$lib/types"
    import { log } from "$lib/utils/Logger"

    initLocale()

    let loading: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let isContextMenuOpen: boolean = false
    let isDraggingFromLocal = false
    let filesCount = 0
    let filesDraggingToUpload = []
    $: isFadingOutDragDropOverlay = false

    function toggleSidebar(): void {
        UIStore.toggleSidebar()
    }

    let tabRoutes: string[] = ["chats", "files"]
    let activeTabRoute: string = tabRoutes[1]
    $: openFolders = get(Store.state.openFolders)

    function toggleFolder(folderId: string | number) {
        const currentOpenFolders = openFolders
        const updatedOpenFolders = {
            ...currentOpenFolders,
            [folderId]: !currentOpenFolders[folderId],
        }
        Store.updateFolderTree(updatedOpenFolders)
    }
    const unsubscribeopenFolders = Store.state.openFolders.subscribe(f => {
        openFolders = f
    })
    let dragging_files = 0
    let previewImage: string | null
    let search_filter: string
    let search_component: ChatFilter
    let filesToUpload: HTMLInputElement
    let allFiles: FileInfo[] = get(Store.state.files)
    let currentFolderIdStore = writable<string>("")
    $: currentFiles = allFiles

    const folderStackStore = writable<FileInfo[][]>([allFiles])
    folderStackStore.subscribe(folderStack => {
        currentFiles = folderStack[folderStack.length - 1]
    })

    async function openFolder(folder: FileInfo) {
        await ConstellationStoreInstance.openDirectory(folder.name)
        currentFolderIdStore.set(folder.id)
        folderStackStore.update(stack => {
            const newStack = [...stack, folder.items!]
            return newStack
        })
        getCurrentDirectoryFiles()
    }

    async function goBack() {
        await ConstellationStoreInstance.goBack()
        folderStackStore.update(stack => {
            if (stack.length > 1) {
                stack.pop()
            }
            stack.forEach(sta => {
                sta.forEach(files => {
                    if (files.parentId === "") {
                        currentFolderIdStore.set("")
                    }
                })
            })
            return stack
        })
        getCurrentDirectoryFiles()
    }

    async function createNewDirectory(folder: FileInfo) {
        if (folder.name === "") {
            removeFolderFromStak(folder)
            return
        }
        let newDirCreated = await ConstellationStoreInstance.createDirectory(folder.name)

        newDirCreated.fold(
            err => {
                removeFolderFromStak(folder)
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            _ => {
                folderStackStore.update(folders => {
                    const newFolders = folders.map(folderStack => {
                        if (Array.isArray(folderStack)) {
                            return folderStack.map(file => {
                                if (file.id === folder.id) {
                                    toggleFolder(folder.id)
                                    Store.state.files.update(files => {
                                        const exists = files.some(file => file.id === folder.id)
                                        if (!exists) {
                                            return [...files, folder]
                                        }
                                        return files
                                    })
                                    return folder
                                }
                                return file
                            })
                        }
                        return folderStack
                    })
                    return newFolders
                })
            }
        )
        getCurrentDirectoryFiles()
    }

    function removeFolderFromStak(folder: FileInfo) {
        folderStackStore.update(folders => {
            const newFolders = folders.map(folderStack => {
                if (Array.isArray(folderStack)) {
                    return folderStack.filter(file => file.id !== folder.id)
                }
                return folderStack
            })
            return newFolders
        })
    }

    function newFolder() {
        let createNewFolder: FileInfo = {
            id: uuidv4(),
            type: "folder",
            size: 0,
            icon: Shape.Folder,
            remotePath: "",
            name: "",
            source: "",
            isRenaming: OperationState.Loading,
            items: [],
            parentId: $currentFolderIdStore,
        }

        function insertIntoFolder(folders: FileInfo[], parentId: string): FileInfo[] {
            if (parentId === "") {
                return [...folders, createNewFolder]
            }
            return folders.map(folder => {
                if (folder.id === parentId && folder.type === "folder" && folder.items) {
                    toggleFolder(createNewFolder.id)
                    return {
                        ...folder,
                        items: [...folder.items, createNewFolder],
                    }
                }
                if (folder.items && folder.items.length > 0) {
                    return {
                        ...folder,
                        items: insertIntoFolder(folder.items, parentId),
                    }
                }
                return folder
            })
        }

        folderStackStore.update(folders => {
            let newFolders = folders.map(folderStack => {
                if (Array.isArray(folderStack)) {
                    return insertIntoFolder(folderStack, $currentFolderIdStore)
                }
                return folderStack
            })
            for (let i = 1; i < newFolders.length; i++) {
                let prevArray = newFolders[i - 1]
                let currArray = newFolders[i]
                const parentItem = prevArray.find(item => {
                    if (currArray.length === 0) {
                        newFolders[i].push(createNewFolder)
                    }
                    return item.id === currArray[0].parentId
                })
                if (newFolders[i].length === 0) {
                    if (parentItem && parentItem.items) {
                        currArray = [...parentItem.items]
                    }
                }
                if (parentItem && parentItem.items) {
                    newFolders[i] = [...parentItem.items]
                }

                const currentOpenFolders = openFolders
                const updatedOpenFolders = {
                    ...currentOpenFolders,
                    [parentItem?.id!]: !currentOpenFolders[parentItem?.id!],
                }
                Store.updateFolderTree(updatedOpenFolders)
            }
            return newFolders
        })
    }

    let sortable: Sortable | undefined

    function recreateSortable() {
        if (sortable !== undefined) {
            sortable.destroy()
            sortable = undefined
        } else {
            initializeSortable()
        }
    }

    $: if (isContextMenuOpen || !isContextMenuOpen) {
        recreateSortable()
    }

    let folderClicked: FileInfo = {
        id: "",
        type: "",
        size: 0,
        icon: Shape.Folder,
        remotePath: "",
        name: "",
        source: "",
        isRenaming: OperationState.Initial,
        items: [],
    }

    function initializeSortable() {
        const dropzone = document.querySelector(".files") as HTMLElement
        if (dropzone) {
            sortable = new Sortable(dropzone, {
                draggable: isContextMenuOpen ? "" : ".draggable-item",
                plugins: [Plugins.ResizeMirror, Plugins.SortAnimation],
            })

            sortable.on("sortable:stop", event => {
                const items = sortable!.getDraggableElementsForContainer(dropzone)
                const newOrderIds = Array.from(items)
                    .filter(child => child.getAttribute("data-id"))
                    .map(child => child.getAttribute("data-id"))
                currentFiles = newOrderIds.map(id => {
                    const file = currentFiles.find(file => file.id === id)
                    return file ? file : null
                }) as FileInfo[]
                Store.updateFileOrder(currentFiles)
                ConstellationStoreInstance.setItemsOrders(currentFiles)
            })

            let lastClickTime = 0
            let lastClickTarget: HTMLElement | null = null
            function updateFilesFromFolder(folder: FileInfo): void {
                if (folder.items && folder.items.length > 0) {
                    Store.updateFileOrder(folder.items)
                }
            }
            dropzone.addEventListener("mousedown", event => {
                let target = event.target as HTMLElement
                while (target && !target.classList.contains("draggable-item")) {
                    target = target.parentElement as HTMLElement
                }

                const currentTime = Date.now()
                if (lastClickTarget === target && currentTime - lastClickTime < 200) {
                    if (lastClickTarget.classList.contains("folder-draggable")) {
                        const targetId = target.dataset.id
                        const targetFolder = currentFiles.find(item => item.id === targetId)
                        if (targetFolder) {
                            folderClicked = targetFolder
                        }
                        if (target) {
                            const targetId = target.dataset.id
                            const targetFolder = currentFiles.find(item => item.id === targetId)
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
        }
    }

    function itemsToFileInfo(items: Item[]): FileInfo[] {
        let filesInfo: FileInfo[] = []
        items.forEach(item => {
            let newItem: FileInfo = {
                id: item!.id(),
                type: item.is_file() ? "file" : "folder",
                icon: item.is_file() ? Shape.Document : Shape.Folder,
                name: item.is_file() ? splitFileName(item.name()).name : item!.name(),
                size: item!.size(),
                remotePath: item!.path(),
                isRenaming: OperationState.Initial,
                extension: item.is_file() ? splitFileName(item.name()).extension : "",
                source: "",
                items: item.is_file() ? undefined : itemsToFileInfo(item.directory()!.get_items()),
            }
            filesInfo = [...filesInfo, newItem]
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

    async function getCurrentDirectoryFiles() {
        let files = await ConstellationStoreInstance.getCurrentDirectoryFiles()
        files.onSuccess(items => {
            let newFilesInfo = itemsToFileInfo(items)
            let filesSet = new Set(newFilesInfo)
            Store.state.files.set(Array.from(filesSet))
            currentFiles = Array.from(filesSet)
        })
    }

    onMount(() => {
        initializeSortable()
        getCurrentDirectoryFiles()
    })

    onDestroy(() => {
        unsubscribeopenFolders()
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
        dragging_files = 0
        isFadingOutDragDropOverlay = true
        let filesToUpload = event.dataTransfer?.files
        isDraggingFromLocal = false
        filesCount = 0
        if (filesToUpload) {
            filesCount = filesToUpload.length
            for (let i = 0; i < filesCount; i++) {
                const file = filesToUpload[i]
                console.log("file: ", file)
                const stream = file.stream()
                await uploadFilesFromDrop(file.name, stream, file.size)
            }
        }
        getCurrentDirectoryFiles()
        setTimeout(() => {
            isFadingOutDragDropOverlay = false
        }, 300)
    }

    async function uploadFilesFromDrop(name: string, stream: ReadableStream, size: number) {
        let result = await ConstellationStoreInstance.uploadFilesFromStream(name, stream, size)
        result.onFailure(err => {
            Store.addToastNotification(new ToastMessage("", err, 2))
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
                let result = await ConstellationStoreInstance.uploadFilesFromStream(file.name, stream, file.size)
                result.onFailure(err => {
                    Store.addToastNotification(new ToastMessage("", err, 2))
                })
            }
        }
        target.value = ""
        getCurrentDirectoryFiles()
    }

    async function deleteItem(file_name: string) {
        let result = await ConstellationStoreInstance.deleteItem(file_name)
        result.fold(
            err => {
                // TODO(Lucas): Error not mapped yet
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            _ => {
                getCurrentDirectoryFiles()
            }
        )
    }

    async function renameItem(old_name: string, new_name: string) {
        if (new_name === "") {
            Store.addToastNotification(new ToastMessage("", "Invalid name provided", 2))
            return
        }
        let result = await ConstellationStoreInstance.renameItem(old_name, new_name)
        result.fold(
            err => {
                if (err === WarpError.ITEM_ALREADY_EXIST_WITH_SAME_NAME) {
                    currentFiles = currentFiles.map(file => {
                        if (file.name === old_name) {
                            file.name = old_name
                            file.isRenaming = OperationState.Error
                        }
                        return file
                    })
                    return
                }
                Store.addToastNotification(new ToastMessage("", err, 2))
            },
            _ => {
                currentFiles = currentFiles.map(file => {
                    if (file.name === old_name) {
                        file.name = new_name
                        file.isRenaming = OperationState.Success
                    }
                    return file
                })
            }
        )
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
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }
        )
    }

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))
    let chats: Chat[] = get(UIStore.state.chats)
    UIStore.state.chats.subscribe(sc => (chats = sc))
    let activeChat: Chat = get(Store.state.activeChat)
    Store.state.activeChat.subscribe(c => (activeChat = c))
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
    {#if isDraggingFromLocal || isFadingOutDragDropOverlay}
        <div class="overlay {isFadingOutDragDropOverlay ? 'fade-out' : ''}">
            <div class="upload-box">
                <p>{filesCount > 1 ? $_('files.dragging_files').replace('{count}', filesCount.toString()) : $_('files.dragging_file')}</p>
            </div>
        </div>
    {/if}
    <!-- Modals -->
    {#if previewImage}
        <Modal
            on:close={_ => {
                previewImage = null
            }}>
            <svelte:fragment slot="controls">
                <Button
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

    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Files} bind:search={search_filter} on:search={() => search_component.filter_chat()} on:enter={onSearchEnter}>
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
            {#each chats as chat}
                <ContextMenu
                    items={[
                        {
                            id: "hide",
                            icon: Shape.EyeSlash,
                            text: "Hide",
                            appearance: Appearance.Default,
                            onClick: () => UIStore.removeSidebarChat(chat),
                        },
                        {
                            id: "mark_read",
                            icon: Shape.CheckMark,
                            text: "Mark Read",
                            appearance: Appearance.Default,
                            onClick: () => {},
                        },
                    ]}>
                    <ChatPreview slot="content" let:open on:contextmenu={open} chat={chat} loading={loading} simpleUnreads cta={activeChat === chat} />
                </ContextMenu>
            {/each}
        {/if}
        {#if activeTabRoute === "files"}
            <ul class="folderList" data-cy="folder-list">
                {#each currentFiles as file}
                    <FolderItem file={file} openFolders={openFolders} toggleFolder={toggleFolder} />
                {/each}
            </ul>
        {/if}
    </Sidebar>
    <div class="content">
        <Topbar>
            <div slot="controls" class="before flex-column">
                <Controls>
                    <Button appearance={Appearance.Alt} text="Sync" disabled>
                        <Icon icon={Shape.ArrowsLeftRight} />
                    </Button>
                    <Button appearance={Appearance.Alt} text="Create Node" disabled hideTextOnMobile>
                        <Icon icon={Shape.Info} />
                    </Button>
                </Controls>
            </div>
        </Topbar>
        <Topbar hideSidebarToggle>
            <div slot="before" class="before">
                <button class="stat">
                    <Label text="Free Space" /><Text singleLine>
                        {prettyBytes(885312355333383)}
                    </Text>
                </button>
                <button class="stat">
                    <Label text="Total Space" /><Text singleLine>
                        {prettyBytes(13223423884917234002)}
                    </Text>
                </button>
            </div>
            <svelte:fragment slot="controls">
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
            </svelte:fragment>
        </Topbar>
        <div class="folder-back">
            <Button hook="button-folder-back" appearance={Appearance.Alt} class="folder-back" on:click={goBack}>Go Back</Button>
        </div>
        <div class="files">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each currentFiles as item, index (item.id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
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
                                    text: "Rename",
                                    appearance: Appearance.Default,
                                    onClick: async () => {
                                        currentFiles = currentFiles.map(file => {
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
                                    text: "Download",
                                    appearance: Appearance.Default,
                                    onClick: async () => {
                                        downloadFile(`/${item.name}.${item.extension}`)
                                    },
                                },
                                {
                                    id: "delete-" + item.id,
                                    icon: Shape.Trash,
                                    text: "Delete",
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
                                on:rename={async e => {
                                    renameItem(item.name, e.detail)
                                }}
                                isRenaming={item.isRenaming}
                                kind={FilesItemKind.File}
                                info={item} />
                        </ContextMenu>
                    {:else if item.type === "folder"}
                        <ContextMenu
                            hook="context-menu-folder"
                            on:close={_ => {
                                isContextMenuOpen = false
                            }}
                            items={[
                                {
                                    id: "delete-" + item.id,
                                    icon: Shape.XMark,
                                    text: "Delete",
                                    appearance: Appearance.Default,
                                    onClick: () => {
                                        // TODO(Lucas): Delete item not working for folders yet
                                        // deleteItem(item.name)
                                    },
                                },
                                {
                                    id: "rename-" + item.id,
                                    icon: Shape.Pencil,
                                    text: "Rename",
                                    appearance: Appearance.Default,
                                    onClick: async () => {
                                        currentFiles = currentFiles.map(file => {
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
                                on:rename={async e => {
                                    if (item.name === "" && e.detail !== "") {
                                        const newName = e.detail
                                        item.name = newName
                                        await createNewDirectory(item)
                                        item.isRenaming = OperationState.Success
                                    } else if (e.detail !== "") {
                                        renameItem(item.name, e.detail)
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
            margin-left: -40px;
        }

        .content {
            display: flex;
            min-height: 0;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
            width: 100%;
            min-width: 0;

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
    }
</style>
