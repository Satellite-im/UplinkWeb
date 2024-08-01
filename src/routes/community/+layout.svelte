<script lang="ts">
    import { Appearance, CommunityChannelKind, Route, Shape, Size } from "$lib/enums"

    import { _ } from "svelte-i18n"
    import { Sidebar } from "$lib/layouts"
    import { ImageEmbed, Modal } from "$lib/components"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import type { CommunityChannel, CommunityChannelGroup } from "$lib/types"
    import Channel from "$lib/components/community/channel/Channel.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { communityChannelGroups } from "$lib/mock/community"
    import Icon from "$lib/elements/Icon.svelte"
    import Button from "$lib/elements/Button.svelte"
    import ChannelGroup from "$lib/components/community/channel/ChannelGroup.svelte"
    import Spacer from "$lib/elements/Spacer.svelte"

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
