<script lang="ts">
    import { Sidebar, Slimbar } from "$lib/layouts"
    import { Route } from "$lib/enums"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"

    import { VoiceRTC } from "$lib/media/Voice"

    import { Input, Label, Button } from "$lib/elements"

    let loading: boolean = false
    let channel: string = "SHFDKLSDF"
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))

    let RTC = new VoiceRTC(channel, {
        audio: true, video: { 
            enabled: false, 
            selfie: false
        } 
    })

    console.log(RTC.local)
</script>

<div id="page">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={() => UIStore.toggleSidebar()} activeRoute={Route.Friends} />
    <Sidebar loading={loading} on:toggle={() => UIStore.toggleSidebar()} open={sidebarOpen} activeRoute={Route.Friends}>
    
    </Sidebar>
    <div class="content">
        <Label text="Channel" />
        <div class="row">
            <Input bind:value={channel} on:input={(_) => RTC.setChannel(channel)}/>
            <Button text="Set Channel"></Button>
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

        .content {
            display: inline-flex;
            flex-direction: column;
            padding: var(--padding);
        }
        
        .row {
            display: inline-flex;
            gap: var(--gap);
        }
    }
</style>
