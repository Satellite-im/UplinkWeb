<script lang="ts">
    import { ConversationStore } from "$lib/state/conversation"
    import { UIStore } from "$lib/state/ui"
    import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { onMount } from "svelte"

    export let rate: number = 5000

    async function poll() {
        // add processes here.
        MultipassStoreInstance.fetchAllFriendsAndRequests()
        let chats = await RaygunStoreInstance.listConversations()
        chats.onSuccess((chats) => {
            console.log("Chats", chats)
            UIStore.state.chats.set(chats)
        })
        setTimeout(poll, rate)
    }

    onMount(() => {
        poll()
    })
</script>
