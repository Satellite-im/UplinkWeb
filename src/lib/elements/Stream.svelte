<script lang="ts">
    import { onMount } from "svelte"

    export let stream: MediaStream | null

    let video: HTMLVideoElement

    async function startStream() {
        if (stream && video) {
            video.srcObject = stream
            video.play()
        }
    }

    onMount(() => {
        startStream()
    })

    $: {
        if (video) {
            video.srcObject = stream
            video.play()
        }
    }
</script>

<div class="stream">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video id="video" bind:this={video}></video>
</div>

<style lang="scss">
    .stream {
        display: inline-flex;

        #video {
            width: 640px;
            height: 360;
            background-color: var(--alt-color);
            border: var(--border-width) solid var(--border-color);
            border-radius: var(--border-radius);
        }
    }
</style>
