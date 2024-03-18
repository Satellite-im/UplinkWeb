<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Appearance, Route, Shape } from "$lib/enums"
    import { Topbar } from "$lib/layouts"
    import { initLocale } from "$lib/lang"
    import Sidebar from "$lib/layouts/Sidebar.svelte"
    import Slimbar from "$lib/layouts/Slimbar.svelte"
    import { _ } from "svelte-i18n"
    import Text from "$lib/elements/Text.svelte";
    import Label from "$lib/elements/Label.svelte"
    import prettyBytes from "pretty-bytes"
    import { chats } from "$lib/mock/users"
    import { ChatPreview, ImageEmbed, ImageFile, Modal, File, Folder, ProgressButton } from "$lib/components"

    // Initialize locale
    initLocale()

    let loading: boolean = false
    let sidebarOpen: boolean = true

    function toggleSidebar(): void {
        sidebarOpen = !sidebarOpen
    }

    let tabRoutes: string[] = ["chats", "files"]
    let activeTabRoute: string = tabRoutes[0]

    let previewImage: string | null
</script>

<div id="page">
    <!-- Modals -->
    {#if previewImage}
        <Modal on:close={(_) => {previewImage = null}}>
            <div slot="controls" class="controls">
                <Button 
                    icon 
                    small 
                    appearance={Appearance.Alt}
                    on:click={(_) => {previewImage = null}}>
                    <Icon icon={Shape.XMark} />
                </Button>
            </div>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}
    
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Files} />
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Files} >
       <div class="controls">
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
       </div>
       {#if activeTabRoute === "chats"}
            {#each chats as chat}
                <ChatPreview
                    loading={loading}
                    users={chat.users}
                    typing={chat.activity}
                    simpleUnreads
                    notifications={chat.notifications}
                    timestamp={chat.last_message_at}
                    message={chat.last_message_preview} />
            {/each}
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
                        <Icon icon={Shape.Coins} />
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
            <div slot="controls" class="controls">
                <Button appearance={Appearance.Alt} icon tooltip={$_("files.new_folder")}>
                    <Icon icon={Shape.FolderPlus} />
                </Button>
                <Button appearance={Appearance.Alt} icon tooltip={$_("files.upload")}>
                    <Icon icon={Shape.Plus} />
                </Button>
                <ProgressButton appearance={Appearance.Alt} icon={Shape.ArrowsUpDown} />
            </div>
        </Topbar>

        <div class="body">
            <div class="files">
                <ImageFile filesize={39222} name="Fake File" on:click={(_) => {
                    previewImage = "/src/lib/assets/library.avif"
                }} />
                <File filesize={39222} name="Fake File" />
                <Folder filesize={39382992} name="Fake Folder 2" />
            </div>
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
        
        .controls {
            display: inline-flex;
            gap: var(--gap);
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
        
        .content {
            display: flex;
            min-height: 0;
            display: flex;
            flex-direction: column;
            flex: 1;

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

            .body {
                height: 100%;
                display: inline-flex;
                flex-direction: column;

                .files {
                    padding: var(--padding);
                    width: 100%;
                    flex: 1;
                }
            }
        }
    }
</style>
