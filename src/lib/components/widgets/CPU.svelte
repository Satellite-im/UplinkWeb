<script lang="ts">
    import { Icon } from "$lib/elements"
    import Text from "$lib/elements/Text.svelte"
    import { Shape } from "$lib/enums"
    import { onMount } from "svelte"
    import { writable } from "svelte/store"

    interface CPUStatus {
        cores: number
    }

    const cpuStatus = writable<CPUStatus>({ cores: 0 })

    onMount(() => {
        function updateCPUInfo() {
            const cores = navigator.hardwareConcurrency
            cpuStatus.set({ cores })
        }

        updateCPUInfo()
    })
</script>

<div data-cy="cpu-indicator" class="cpu-indicator">
    <Icon icon={Shape.CPU} />
    <Text hook="cpu-indicator-value">
        {$cpuStatus.cores} core
    </Text>
</div>

<style>
    .cpu-indicator {
        display: flex;
        align-items: center;
        gap: var(--gap-less);
        background-color: var(--light-grey);
        border-radius: var(--border-radius);
    }
</style>
