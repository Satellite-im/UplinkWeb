<script lang="ts">
    import { Sidebar, Slimbar } from "$lib/layouts"
    import { Route } from "$lib/enums"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"

    import { VoiceRTC } from "$lib/media/Voice"

    let loading: boolean = false
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))

    let RTC = new VoiceRTC({ audio: true, video: false })

</script>

<div id="page">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={() => UIStore.toggleSidebar()} activeRoute={Route.Friends} />
    <Sidebar loading={loading} on:toggle={() => UIStore.toggleSidebar()} open={sidebarOpen} activeRoute={Route.Friends}>
    
    </Sidebar>
    <div class="content">
        { JSON.stringify(RTC.local) }
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
