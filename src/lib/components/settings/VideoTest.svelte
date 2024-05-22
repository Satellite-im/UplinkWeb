<script lang="ts">
    import { Button, Icon } from "$lib/elements"
    import { Shape } from "$lib/enums"

    let video: HTMLVideoElement;

    async function startVideoTest() {
        const constraints = {
            audio: { deviceId: undefined },
            video: { deviceId: undefined }
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("MediaDevices API or getUserMedia is not supported in your browser.")
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            video.srcObject = stream
            video.play()
        } catch (err) {
            console.error("Accessing the microphone failed:", err)
        }
    }
</script>

<div class="video-preview">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video autoplay id="test" bind:this={video} >

    </video>
    <Button text="Test Video" on:click={(_) => startVideoTest()}>
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
</style>
