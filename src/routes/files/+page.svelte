<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, FilesItemKind, Route, Shape } from "$lib/enums"
    import { Topbar } from "$lib/layouts"
    import { initLocale } from "$lib/lang"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { _ } from "svelte-i18n"
    import Text from "$lib/elements/Text.svelte"
    import Label from "$lib/elements/Label.svelte"
    import prettyBytes from "pretty-bytes"
    import { ChatPreview, ImageEmbed, ImageFile, Modal, FileFolder, ProgressButton, ContextMenu } from "$lib/components"
    import Controls from "$lib/layouts/Controls.svelte"
    import { Plugins } from '@shopify/draggable'
    import { onDestroy, onMount } from 'svelte'
    import {Sortable} from '@shopify/draggable'
    import type { Chat, ContextItem, FileInfo } from "$lib/types"
    import { get, writable } from "svelte/store"
    import { Store } from "$lib/state/store"
    import { UIStore } from "$lib/state/ui"
    import FolderItem from "./FolderItem.svelte"

    initLocale()

    let loading: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

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
        [folderId]: !currentOpenFolders[folderId]
    }
        Store.updateFolderTree(updatedOpenFolders)
    }
    const unsubscribeopenFolders = Store.state.openFolders.subscribe((f) => {
        openFolders = f
        })
    let previewImage: string | null

    // TODO: Move this into a global state
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []
    let allFiles: FileInfo[] = get(Store.state.files)
    let currentFolderIdStore = writable<string>("")
    $: currentFiles = allFiles

    const folderStackStore = writable<FileInfo[][]>([allFiles])

    folderStackStore.subscribe(folderStack => {
        currentFiles = folderStack[folderStack.length - 1]
    });

    function openFolder(folder: FileInfo) {
        currentFolderIdStore.set(folder.id)
        folderStackStore.update(stack => {
        const newStack = [...stack, folder.items || []]
        return newStack
        });
    }

    function goBack() {
        folderStackStore.update(stack => {
        if (stack.length > 1) {
            stack.pop()
        }
        return stack
        })
    }

    let folderClicked: FileInfo = {
      id: "",
      type: "",
      size: 0,
      name: "",
      source: "",
      items: []
    }
    
    onMount(() => {
    const dropzone = document.querySelector('.files') as HTMLElement
    if (dropzone) {
        const sortable = new Sortable(dropzone, {
            draggable: ".draggable-item",
            plugins: [Plugins.ResizeMirror, Plugins.SortAnimation],
        })

        sortable.on('sortable:stop', (event) => {
            const items = sortable.getDraggableElementsForContainer(dropzone)
            const newOrderIds = Array.from(items)
                .filter(child => child.getAttribute('data-id'))
                .map(child => child.getAttribute('data-id'))

            currentFiles = newOrderIds
                .map(id => {
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
        dropzone.addEventListener('mousedown', (event) => {
            let target = event.target as HTMLElement
            while (target && !target.classList.contains('draggable-item')) {
                target = target.parentElement as HTMLElement
            }

            const currentTime = Date.now()
            if (lastClickTarget === target && currentTime - lastClickTime < 200) {
            if (lastClickTarget.classList.contains('folder-draggable')) {
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
})
    onDestroy(() => {
        unsubscribeopenFolders()
    })

    UIStore.state.sidebarOpen.subscribe((s) => sidebarOpen = s)
    let chats: Chat[] = get(UIStore.state.chats)
    UIStore.state.chats.subscribe((sc) => chats = sc)
    let activeChat: Chat = get(Store.state.activeChat)
    Store.state.activeChat.subscribe((c) => activeChat = c)

</script>

<div id="page">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <!-- Modals -->
    {#if previewImage}
        <Modal on:close={(_) => {previewImage = null}}>
            <svelte:fragment slot="controls">
                <Button 
                    icon 
                    small 
                    appearance={Appearance.Alt}
                    on:click={(_) => {previewImage = null}}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </svelte:fragment>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}
    
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Files} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Files} >
        <Controls>
            <Button 
                appearance={activeTabRoute === "chats" ? Appearance.Primary : Appearance.Alt}
                text={$_("chat.chat_plural")}
                on:click={(_) => {
                    activeTabRoute = "chats"
                }}>
                <Icon icon={Shape.ChatBubble} />
            </Button>
            <Button
                appearance={activeTabRoute === "files" ? Appearance.Primary : Appearance.Alt}
                text={$_("files.file_plural")}
                on:click={(_) => {
                    activeTabRoute = "files"
                }}>
                <Icon icon={Shape.Folder} />
            </Button>
        </Controls>
        {#if activeTabRoute === "chats"}
            {#each chats as chat}
                <ChatPreview
                    chat={chat}
                    loading={loading}
                    simpleUnreads
                    cta={activeChat === chat}
                    on:context={(evt) => {
                        contextPosition = evt.detail
                        contextData = [
                            {
                                id: "hide",
                                icon: Shape.EyeSlash,
                                text: "Hide",
                                appearance: Appearance.Default,
                                onClick: () => UIStore.removeSidebarChat(chat)
                            },
                            {
                                id: "mark_read",
                                icon: Shape.CheckMark,
                                text: "Mark Read",
                                appearance: Appearance.Default,
                                onClick: () => {}
                            },
                        ]
                    }} />
            {/each}
        {/if}
        {#if activeTabRoute === "files"}
        <ul class="folderList">
            {#each currentFiles as file}
                <FolderItem
                    file={file}
                    openFolders={openFolders}
                    toggleFolder={toggleFolder}
                />
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
                        <Icon icon={Shape.Starlight} />
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
                    <Label text="Free Space"/><Text singleLine>
                        {prettyBytes(885312355333383)}
                    </Text>
                </button>
                <button class="stat">
                    <Label text="Total Space"/><Text singleLine>
                        {prettyBytes(13223423884917234002)}
                    </Text>
                </button>
                <button class="stat">
                    <Label text="Sync Size"/><Text singleLine>
                        {prettyBytes(38481083182)}
                    </Text>
                </button>
                <button class="stat">
                    <Label text="Shuttle"/><Text singleLine>
                        {prettyBytes(12345344)}
                    </Text>
                </button>
            </div>
            <svelte:fragment slot="controls">
                <Button appearance={Appearance.Alt} icon tooltip={$_("files.new_folder")}>
                    <Icon icon={Shape.FolderPlus} />
                </Button>
                <Button appearance={Appearance.Alt} icon tooltip={$_("files.upload")}>
                    <Icon icon={Shape.Plus} />
                </Button>
                <ProgressButton appearance={Appearance.Alt} icon={Shape.ArrowsUpDown} />
            </svelte:fragment>
        </Topbar>
        <button on:click={goBack}>Go Back</button>
        <!-- <Breadcrumb folder={folderClicked} folderRoot={files}></Breadcrumb> -->
        <div class="files">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each currentFiles as item (item.id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                    class="draggable-item {item.id} {item.type === 'folder' ? 'folder-draggable droppable' : ''}"
                    draggable="true"
                    data-id={item.id}
                >
                    {#if item.type === "file"}
                        <FileFolder kind={FilesItemKind.File} info={item} on:context={(evt) => {
                            contextPosition = evt.detail;
                            contextData = [
                                {
                                    id: "delete",
                                    icon: Shape.XMark,
                                    text: "Delete",
                                    appearance: Appearance.Default,
                                    onClick: () => {}
                                }
                            ];
                        }} />       
                    {:else if item.type === "folder"}
                        <FileFolder kind={FilesItemKind.Folder} info={item} on:context={(evt) => {
                            contextPosition = evt.detail;
                            contextData = [
                                {
                                    id: "delete",
                                    icon: Shape.XMark,
                                    text: "Delete",
                                    appearance: Appearance.Default,
                                    onClick: () => {}
                                }
                            ];
                        }} />
                    {:else if item.type === "image"}
                        <ImageFile filesize={item.size} name={item.name} on:click={(_) => {
                            previewImage = item.source;
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
    }
</style>
