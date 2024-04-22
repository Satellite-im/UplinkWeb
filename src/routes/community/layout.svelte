<script lang="ts">
    import { Route } from "$lib/enums"
    import { initLocale } from "$lib/lang"
    import { _ } from "svelte-i18n"
    import { Sidebar, Slimbar } from "$lib/layouts"
    import { ImageEmbed, Modal } from "$lib/components"
    import ContextMenu from "$lib/components/ui/ContextMenu.svelte"
    import { type ContextItem } from "$lib/types"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"

    initLocale()

    let loading = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    let previewImage: string | null
    let contextPosition: [number, number] = [0, 0]
    let contextData: ContextItem[] = []

    UIStore.state.sidebarOpen.subscribe((s) => sidebarOpen = s)
</script>

<div id="page">
    <!-- Context Menu-->
    <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={(_) => contextData = []} />

    <!-- Modals -->
    {#if previewImage}
        <Modal on:close={(_) => {previewImage = null}}>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}

    <!-- Sidebar -->
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={toggleSidebar} activeRoute={Route.Chat}></Slimbar>

    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Chat}>
        
    </Sidebar>

    <div class="content">
       
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;

    }
</style>