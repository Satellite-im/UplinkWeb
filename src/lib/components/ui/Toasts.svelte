<script lang="ts">
    import type { ToastMessage } from "$lib/state/ui/toast"
    import { Store } from "$lib/state/Store"
    import { get } from "svelte/store"
    import Toast from "$lib/elements/Toast.svelte"

    let toasts: { [key: string]: [ToastMessage, NodeJS.Timeout] } = get(Store.state.toasts)
    Store.state.toasts.subscribe(t => (toasts = t))
</script>

{#each Object.entries(toasts) as [id, [toast, _]]}
    <Toast toast={toast} on:mouseenter={_ => Store.pauseToastTimeout(id)} on:mouseleave={_ => Store.resumeToastTimeout(id)} on:click={_ => Store.removeToast(id)} />
{/each}

<style lang="scss">
</style>
