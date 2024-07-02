<script lang="ts">
    import { onDestroy, onMount } from "svelte"
    import { writable } from "svelte/store"

    interface MemoryStatus {
        usedJSHeapSize: number
        totalJSHeapSize: number
    }

    const memoryStatus = writable<MemoryStatus>({
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
    })

    let interval: any
    onMount(() => {
        function updateMemoryInfo() {
            const memory = performance.memory
            if (memory) {
                memoryStatus.set({
                    usedJSHeapSize: memory.usedJSHeapSize,
                    totalJSHeapSize: memory.totalJSHeapSize,
                })
            }
        }

        updateMemoryInfo()

        interval = setInterval(updateMemoryInfo, 10000)
    })
    onDestroy(() => {
        clearInterval(interval)
    })
</script>

<div class="memory-indicator">
    <div class="memory-bar">
        <div class="memory-level" style="width: {($memoryStatus.usedJSHeapSize / $memoryStatus.totalJSHeapSize) * 100}%;"></div>
    </div>
    {(($memoryStatus.usedJSHeapSize / $memoryStatus.totalJSHeapSize) * 100).toFixed(0)}%
</div>

<style>
    .memory-indicator {
        display: flex;
        align-items: center;
        gap: var(--gap-less);
    }

    .memory-bar {
        width: 2rem;
        height: 1rem;
        padding: 2px;
        border: var(--border-width) solid currentColor;
        border-radius: 5px;
        position: relative;
        overflow: hidden;
    }

    .memory-level {
        height: 100%;
        background-color: var(--primary-color);
        transition: width 0.3s ease;
    }
</style>
