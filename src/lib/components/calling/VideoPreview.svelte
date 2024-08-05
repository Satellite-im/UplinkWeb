<script lang="ts">
    import { onMount } from "svelte"

    export let show: boolean = false
    let previewVideo: HTMLDivElement

    onMount(() => {
        const video = previewVideo

        video.addEventListener("mousedown", onMouseDown)

        function onMouseDown(event: any) {
            event.preventDefault()
            const offsetX = event.clientX - video.getBoundingClientRect().left
            const offsetY = event.clientY - video.getBoundingClientRect().top

            document.addEventListener("mousemove", onMouseMove)
            document.addEventListener("mouseup", onMouseUp)

            video.addEventListener("dblclick", () => {
                // TODO: Go to call
            })

            function onMouseMove(event: any) {
                let newLeft = event.clientX - offsetX
                let newTop = event.clientY - offsetY

                // Ensure the video stays within the bounds of the screen
                newLeft = Math.max(0, Math.min(window.innerWidth - video.offsetWidth, newLeft))
                newTop = Math.max(0, Math.min(window.innerHeight - video.offsetHeight, newTop))

                video.style.left = `${newLeft}px`
                video.style.top = `${newTop}px`
            }

            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove)
                document.removeEventListener("mouseup", onMouseUp)

                // Snap to position (example: snap to corners)
                const middleX = window.innerWidth / 2
                const middleY = window.innerHeight / 2

                if (parseInt(video.style.left) < middleX / 2) {
                    video.style.left = "0px"
                } else if (parseInt(video.style.left) > middleX * 1.5) {
                    video.style.left = `${window.innerWidth - video.offsetWidth}px`
                }

                if (parseInt(video.style.top) < middleY / 2) {
                    video.style.top = "0px"
                } else if (parseInt(video.style.top) > middleY * 1.5) {
                    video.style.top = `${window.innerHeight - video.offsetHeight}px`
                }

                video.classList.add("snap-animation")
                setTimeout(() => {
                    video.classList.remove("snap-animation")
                }, 300)
            }
        }
    })
</script>

{#if show}
    <div id="video-preview" class="video-preview">
        <div id="preview-video" bind:this={previewVideo}></div>
    </div>
{/if}

<style lang="scss">
    #video-preview {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;

        #preview-video {
            width: 400px;
            height: 225px;
            background: var(--background-alt);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
            position: absolute;
            top: 0;
            right: 0;
            cursor: grab;
            pointer-events: all;
            transition: transform 0.3s ease;
            margin: var(--gap);

            &.snap-animation {
                transition:
                    left 0.3s ease,
                    top 0.3s ease;
            }
        }
    }
</style>
