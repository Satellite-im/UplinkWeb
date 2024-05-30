<script lang="ts">
    import { Sidebar, Slimbar } from "$lib/layouts"
    import { Route } from "$lib/enums"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"

    import { VoiceRTC } from "$lib/media/Voice"

    import { Input, Label, Button } from "$lib/elements"
    import Stream from "$lib/elements/Stream.svelte"
    import { onMount } from "svelte"

    let loading: boolean = false
    let channel: string = "SHFDKLSDF"
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))

    let RTC = new VoiceRTC(channel, {
        audio: true,
        video: {
            enabled: false,
            selfie: false,
        },
    })

    console.log(RTC.local)

    let localStream: MediaStream

    export let audioInput: string | undefined
    export let videoInput: string | undefined

    async function startVideoTest() {
        const constraints = {
            audio: { deviceId: audioInput },
            video: { deviceId: videoInput },
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("MediaDevices API or getUserMedia is not supported in your browser.")
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            localStream = stream
        } catch (err) {
            console.error("Accessing the microphone failed:", err)
        }
    }

    onMount(() => {
        startVideoTest()
    })
</script>

<div id="page">
    <Slimbar sidebarOpen={sidebarOpen} on:toggle={() => UIStore.toggleSidebar()} activeRoute={Route.Friends} />
    <Sidebar loading={loading} on:toggle={() => UIStore.toggleSidebar()} open={sidebarOpen} activeRoute={Route.Friends}></Sidebar>
    <div class="content">
        <Label text="Channel" />
        <div class="row">
            <Input bind:value={channel} on:input={_ => RTC.setChannel(channel)} />
            <Button text="Set Channel"></Button>
        </div>

        <div class="participants">
            <div class="local">
                <Label text="Local Stream" />
                <Stream stream={localStream} />
            </div>
            <div class="remote">
                <Label text="Remote Stream" />
                <Stream stream={null} />
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

        .content {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
            padding: var(--padding);
        }

        .row {
            display: inline-flex;
            gap: var(--gap);
        }

        .participants {
            display: inline-flex;
            flex-direction: row;
            gap: var(--gap);

            .local,
            .remote {
                display: inline-flex;
                flex-direction: column;
            }
        }
    }
</style>
