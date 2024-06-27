<script lang="ts">
    import { Appearance, CommunityChannelKind, Route, Shape, Size } from "src/lib/enums"
    import { initLocale } from "src/lib/lang"
    import { _ } from "svelte-i18n"
    import { Sidebar } from "src/lib/layouts"
    import { ImageEmbed, Modal } from "src/lib/components"
    import { get } from "svelte/store"
    import { UIStore } from "src/lib/state/ui"
    import type { CommunityChannel, CommunityChannelGroup } from "src/lib/types"
    import Channel from "src/lib/components/community/channel/Channel.svelte"
    import Label from "src/lib/elements/Label.svelte"
    import { communityChannelGroups } from "src/lib/mock/community"
    import Icon from "src/lib/elements/Icon.svelte"
    import Button from "src/lib/elements/Button.svelte"
    import ChannelGroup from "src/lib/components/community/channel/ChannelGroup.svelte"
    import Spacer from "src/lib/elements/Spacer.svelte"

    initLocale()

    let loading = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    function toggleSidebar() {
        UIStore.toggleSidebar()
    }

    let previewImage: string | null

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))
</script>

<div id="page">
    <!-- Context Menu-->
    <!-- Unused atm -->
    <!-- <ContextMenu visible={contextData.length > 0} items={contextData} coords={contextPosition} on:close={_ => (contextData = [])} /> -->

    <!-- Modals -->
    {#if previewImage}
        <Modal
            on:close={_ => {
                previewImage = null
            }}>
            <ImageEmbed big source={previewImage} />
        </Modal>
    {/if}

    <!-- Sidebar -->
    <Sidebar loading={loading} on:toggle={toggleSidebar} open={sidebarOpen} activeRoute={Route.Chat}>
        {#each communityChannelGroups as group}
            <ChannelGroup group={group} />
        {/each}
    </Sidebar>

    <div class="content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    #page {
        display: flex;
        margin: 0;
        flex: 1;
        height: 100%;
        overflow: hidden;

        .content {
            flex: 1;
            min-width: 0;
        }
    }
</style>
