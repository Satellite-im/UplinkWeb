<script lang="ts">
    import { Store } from "$lib/state/Store"
    import { UIStore } from "$lib/state/ui"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { onMount } from "svelte"
    import { get } from "svelte/store"

    export let rate: number = 5000

    let currentInterval = 100
    let activeChat = get(Store.state.activeChat)
    async function poll() {
        // add processes here.
        updateTypingIndicators()
        await MultipassStoreInstance.fetchAllFriendsAndRequests()

        // Increase the interval exponentially until it reaches the provided rate
        if (currentInterval < rate) {
            currentInterval = Math.min(currentInterval * 2, rate)
        }

        setTimeout(poll, currentInterval)
    }

    async function updateTypingIndicators() {
        UIStore.updateTypingIndicators(activeChat)
    }

    onMount(() => {
        poll()
    })
</script>
