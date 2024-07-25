<script lang="ts">
    import { Status } from "$lib/enums"
    import { ConversationStore } from "$lib/state/conversation"
    import { Store } from "$lib/state/Store.js"
    import { UIStore } from "$lib/state/ui"
    import type { Chat, User } from "$lib/types"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { onMount } from "svelte"
    import { get } from "svelte/store"

    export let rate: number = 5000

    async function poll() {
        // add processes here.
        await MultipassStoreInstance.fetchAllFriendsAndRequests()
        setTimeout(poll, rate)
    }

    onMount(() => {
        poll()
    })
</script>
