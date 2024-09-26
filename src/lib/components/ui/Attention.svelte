<script lang="ts">
    import { onMount, afterUpdate } from "svelte"
    import { writable } from "svelte/store"

    export let id: string = ""
    export let circleSize: number = 60 // Default circle size
    export let highlightElement: boolean = true // Default highlight to true
    let circleX = writable(0)
    let circleY = writable(0)

    // Update circle position based on the target element's position
    const updateCirclePosition = () => {
        const targetElement = document.getElementById(id)
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect()
            circleX.set(rect.left + rect.width / 2)
            circleY.set(rect.top + rect.height / 2)
        }
    }

    // Watch for targetId changes and update position
    $: id, updateCirclePosition()

    // Watch for circleSize changes and update the style
    $: circleSize, updateCircleSize()

    const updateCircleSize = () => {
        document.documentElement.style.setProperty("--circle-size", `${circleSize}px`)
    }

    onMount(() => {
        window.addEventListener("resize", updateCirclePosition)
        return () => {
            window.removeEventListener("resize", updateCirclePosition)
        }
    })

    // Fix the position of the highlighted element
    afterUpdate(() => {
        const targetElement = document.getElementById(id)
        if (targetElement && highlightElement) {
            const rect = targetElement.getBoundingClientRect()
            targetElement.style.position = "fixed"
            targetElement.style.top = `${rect.top}px`
            targetElement.style.left = `${rect.left}px`
            targetElement.style.width = `${rect.width}px`
            targetElement.style.height = `${rect.height}px`
            targetElement.style.zIndex = "1001" // Above the blur mask
        }
    })
</script>

<div
    class="mask {highlightElement ? 'highlight' : ''}"
    style="
      --circleX: {$circleX}px;
      --circleY: {$circleY}px;
      display: {highlightElement ? 'block' : 'none'};
    ">
</div>

<style>
    .mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1000;
        backdrop-filter: blur(10px); /* Blurring the entire screen */
    }

    .mask::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.2);
        mask: radial-gradient(circle var(--circle-size) at var(--circleX) var(--circleY), transparent var(--circle-size), black var(--circle-size));
        -webkit-mask: radial-gradient(circle var(--circle-size) at var(--circleX) var(--circleY), transparent var(--circle-size), black var(--circle-size));
    }

    .mask:not(.highlight)::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        border-radius: 50%;
        border: 2px solid var(--info-color);
        transform: translate(calc(var(--circleX) - var(--circle-size)), calc(var(--circleY) - var(--circle-size)));
        width: calc(var(--circle-size) * 2);
        height: calc(var(--circle-size) * 2);
        box-sizing: border-box;
    }
</style>
