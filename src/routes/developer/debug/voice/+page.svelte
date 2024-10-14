<script lang="ts">
    import { Sidebar } from "$lib/layouts"
    import { Route } from "$lib/enums"
    import { get } from "svelte/store"
    import { UIStore } from "$lib/state/ui"
    import { Input, Label, Button } from "$lib/elements"
    import Stream from "$lib/elements/Stream.svelte"
    import { onDestroy, onMount } from "svelte"
    import { log } from "$lib/utils/Logger"
    import BatteryIndicator from "$lib/components/widgets/BatteryIndicator.svelte"
    import { _ } from "svelte-i18n"

    let loading: boolean = false
    let channel: string = "SHFDKLSDF"
    let sidebarOpen: boolean = get(UIStore.state.sidebarOpen)

    UIStore.state.sidebarOpen.subscribe(s => (sidebarOpen = s))

    let localStream: MediaStream
    let remoteStream: MediaStream

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
            localStream = await navigator.mediaDevices.getUserMedia(constraints)
            // initPeer()
        } catch (err) {
            console.error("Accessing the microphone failed:", err)
        }
    }

    // function initPeer(): void {
    //     peer = new SimplePeer({
    //         initiator: location.hash === "#init",
    //         trickle: false,
    //         stream: localStream,
    //     })

    //     peer.on("signal", (_data: any) => {
    //         // log.info("SIGNAL", JSON.stringify(data))
    //         // Send this data to the remote peer via signaling server
    //     })

    //     peer.on("connect", () => {
    //         log.info("CONNECT")
    //         peer?.send("whatever" + Math.random())
    //     })

    //     peer.on("data", (data: any) => {
    //         log.info("data: " + data)
    //     })

    //     peer.on("stream", (stream: MediaStream) => {
    //         remoteStream = stream
    //     })
    // }

    // function connectToPeer(signalData: any): void {
    //     peer?.signal(signalData)
    // }

    onMount(() => {
        startVideoTest()
    })

    onDestroy(() => {
        localStream.getTracks().forEach(t => t.stop())
    })
</script>

<div id="page">
    <Sidebar loading={loading} on:toggle={() => UIStore.toggleSidebar()} open={sidebarOpen} activeRoute={Route.Friends}></Sidebar>
    <div class="content">
        <Label text={$_("settings.developer.voice.channel")} />
        <div class="row">
            <Input
                bind:value={channel}
                on:input={_ => {
                    /* Add logic if needed */
                }} />
            <Button text={$_("settings.developer.voice.setChannel")}></Button>
        </div>

        <div class="participants">
            <div class="local">
                <Label text={$_("settings.developer.voice.localStream")} />
                <Stream stream={localStream} />
            </div>
            <div class="remote">
                <Label text={$_("settings.developer.voice.remoteStream")} />
                <Stream stream={remoteStream} />
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
            min-width: 0;
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
