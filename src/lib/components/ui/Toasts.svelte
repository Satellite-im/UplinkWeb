<script lang="ts">
    import { Store } from "$lib/state/Store"
    import Toast from "$lib/elements/Toast.svelte"

    $: toasts = Store.state.toasts
</script>

{#each Object.entries($toasts) as [id, [toast, _]]}
    <Toast toast={toast} on:mouseenter={_ => Store.pauseToastTimeout(id)} on:mouseleave={_ => Store.resumeToastTimeout(id)} remove={() => Store.removeToast(id)} />
{/each}
