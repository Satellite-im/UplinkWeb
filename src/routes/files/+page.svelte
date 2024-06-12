<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, FilesItemKind, Route, Shape, Size } from "$lib/enums"
    import { Topbar } from "$lib/layouts"
    import { initLocale } from "$lib/lang"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
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
    import { Store } from "$lib/state/store"
    import { UIStore } from "$lib/state/ui"
    import FolderItem from "./FolderItem.svelte"
    import { v4 as uuidv4 } from "uuid"
    import { goto } from "$app/navigation"
    import { ConstellationStoreInstance } from "$lib/wasm/ConstellationStore"
    import { ToastMessage } from "$lib/state/ui/toast"
    import type { Item } from "warp-wasm"

    initLocale()

    let loading: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)
    let isContextMenuOpen: boolean = false

    function toggleSidebar(): void {
        UIStore.toggleSidebar()
    }

    let tabRoutes: string[] = ["chats", "files"]
    let activeTabRoute: string = tabRoutes[0]
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

    function openFolder(folder: FileInfo) {
        currentFolderIdStore.set(folder.id)
        folderStackStore.update(stack => {
            const newStack = [...stack, folder.items]
            return newStack
        })
    }

    function goBack() {
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
            name: "",
            source: "",
            isRename: true,
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

                if (parentItem && parentItem.items) {
                    if (newFolders[i].length === 0) {
                        currArray = [...parentItem.items]
                    }
                    newFolders[i] = [...parentItem.items]
                }
                Store.updateFolderTree(newFolders)
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
        name: "",
        source: "",
        isRename: false,
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
                name: item!.name(),
                size: item!.size(),
                isRename: false,
                source: "",
                items: item.is_file() ? undefined : itemsToFileInfo(item.directory()!.get_items()),
            }
            filesInfo = [...filesInfo, newItem]
        })
        return filesInfo
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
    }

    function dragLeave() {
        dragging_files--
    }

    function dragDrop(event: DragEvent) {
        event.preventDefault()
        dragging_files = 0
        // upload files
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

    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Files} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Files} bind:search={search_filter} on:search={() => search_component.filter_chat()} on:enter={onSearchEnter}>
        <ChatFilter bind:this={search_component} bind:filter={search_filter}></ChatFilter>
        <Controls>
            <Button
                appearance={activeTabRoute === "chats" ? Appearance.Primary : Appearance.Alt}
                text={$_("chat.chat_plural")}
                on:click={_ => {
                    activeTabRoute = "chats"
                }}>
                <Icon icon={Shape.ChatBubble} />
            </Button>
            <Button
                appearance={activeTabRoute === "files" ? Appearance.Primary : Appearance.Alt}
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
            <ul class="folderList">
                {#each currentFiles as file}
                    <FolderItem file={file} openFolders={openFolders} toggleFolder={toggleFolder} />
                {/each}
            </ul>
        {/if}
    </Sidebar>
    <div class="content">
        <Topbar>
            <div slot="before" class="before flex-column">
                <Label text="Quick Actions" />
                <div class="actions">
                    <Button appearance={Appearance.Alt} text="Sync">
                        <Icon icon={Shape.ArrowsLeftRight} />
                    </Button>
                    <Button appearance={Appearance.Alt} text="Gift Space">
                        <Icon icon={Shape.Gift} />
                    </Button>
                    <Button appearance={Appearance.Alt} text="Rent Space">
                        <Icon size={Size.Large} icon={Shape.Starlight} />
                    </Button>
                    <Button appearance={Appearance.Alt} text="Create Node">
                        <Icon icon={Shape.Info} />
                    </Button>
                </div>
            </div>
        </Topbar>
        <Topbar>
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
                <button class="stat">
                    <Label text="Sync Size" /><Text singleLine>
                        {prettyBytes(38481083182)}
                    </Text>
                </button>
                <button class="stat">
                    <Label text="Shuttle" /><Text singleLine>
                        {prettyBytes(12345344)}
                    </Text>
                </button>
            </div>
            <svelte:fragment slot="controls">
                <Button appearance={Appearance.Alt} on:click={newFolder} icon tooltip={$_("files.new_folder")}>
                    <Icon icon={Shape.FolderPlus} />
                </Button>
                <Button
                    appearance={Appearance.Alt}
                    icon
                    tooltip={$_("files.upload")}
                    on:click={() => {
                        filesToUpload?.click()
                    }}>
                    <Icon icon={Shape.Plus} />
                </Button>
                <input style="display:none" multiple type="file" on:change={e => onFileSelected(e)} bind:this={filesToUpload} />
                <ProgressButton appearance={Appearance.Alt} icon={Shape.ArrowsUpDown} />
            </svelte:fragment>
        </Topbar>
        <div class="folder-back">
            <Button small appearance={Appearance.Alt} class="folder-back" on:click={goBack}>Go Back</Button>
        </div>
        <div class="files">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each currentFiles as item, index (item.id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="draggable-item {item.id} {item.type === 'folder' ? 'folder-draggable droppable' : ''}" draggable="true" data-id={item.id}>
                    {#if item.type === "file"}
                        <ContextMenu
                            on:close={_ => {
                                isContextMenuOpen = false
                            }}
                            items={[
                                {
                                    id: "delete",
                                    icon: Shape.XMark,
                                    text: "Delete",
                                    appearance: Appearance.Default,
                                    onClick: () => {
                                        deleteItem(item.name)
                                    },
                                },
                            ]}>
                            <FileFolder
                                slot="content"
                                let:open
                                on:contextmenu={e => {
                                    isContextMenuOpen = true
                                    open(e)
                                }}
                                kind={FilesItemKind.File}
                                info={item} />
                        </ContextMenu>
                    {:else if item.type === "folder"}
                        <ContextMenu
                            hook="context-menu-folder-{item.id}"
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
                                        item.isRename = true
                                    },
                                },
                            ]}>
                            <FileFolder
                                slot="content"
                                let:open
                                on:contextmenu={e => {
                                    isContextMenuOpen = true
                                    open(e)
                                }}
                                kind={FilesItemKind.Folder}
                                info={item}
                                on:rename={async e => {
                                    // TODO(Lucas): Working just for creating new folder for now
                                    const newName = e.detail
                                    item.name = newName
                                    item.isRename = false
                                    await createNewDirectory(item)
                                }}
                                isEditing={item.isRename} />
                        </ContextMenu>
                    {:else if item.type === "image"}
                        <ImageFile
                            filesize={item.size}
                            name={item.name}
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
            list-style-type: none;
            width: fit-content;
            margin-left: -40px;
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
