<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Shape } from "$lib/enums"
    import { Store } from "$lib/state/Store"
    import { _ } from "svelte-i18n"
    import { get } from "svelte/store"

    export let audioInput: string | undefined
    export let videoInput: string | undefined

    let video: HTMLVideoElement

    Store.state.devices.video.subscribe(d => {
        startVideoTest()
    })

    async function startVideoTest() {
        videoInput = get(Store.state.devices.video)
        const constraints = {
            audio: {
                deviceId: audioInput ? { exact: audioInput } : undefined,
            },
            video: {
                deviceId: videoInput ? { exact: videoInput } : undefined,
            },
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("MediaDevices API or getUserMedia is not supported in your browser.")
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            navigator.mediaDevices.enumerateDevices().then(devices => {
                devices.forEach(device => {
                    console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`)
                })
            })
            video.srcObject = stream
            video.play()
        } catch (err) {
            console.error("Accessing the microphone failed:", err)
        }
    }
</script>

<div class="video-preview">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video data-cy="test-video-preview" autoplay id="test" bind:this={video} muted> </video>
    <Button hook="button-test-video" text={$_("settings.audio.testVideo")} on:click={_ => startVideoTest()}>
        <Icon icon={Shape.Beaker}></Icon>
    </Button>
</div>

<style lang="scss">
    .video-preview {
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);

        #test {
            width: 640px;
            height: 360;
            background-color: var(--alt-color);
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius);
        }
    }

    @media (max-width: 800px) {
        .video-preview {
            width: 100%;
            video {
                max-width: 100%;
            }
        }
    }
</style>
