<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import { Store } from "$lib/state/Store"
    import { PayRequest, wallet } from "$lib/utils/Wallet"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { get } from "svelte/store"
    import { _ } from "svelte-i18n"

    export let onClose

    let payment_request = new PayRequest(0, "sat", "")
    wallet.btc.get_accounts().then(accounts => {
        payment_request.destination = accounts[0].address
    })

    function handleInput(e: Event) {
        const target = e.target as HTMLSelectElement
        payment_request.amount = parseInt(target.value)
    }
    async function sendMessage(text: string) {
        let chat = get(Store.state.activeChat)
        let txt = text.split("\n")
        let result = await RaygunStoreInstance.send(chat.id, txt, [])
        result.onSuccess(res => {
            ConversationStore.addPendingMessages(chat.id, res.message, txt)
        })
    }
</script>

<div>
    <h1>{$_("payments.create") + ":"}</h1>
    <div>{$_("payments.amount") + ":"} <input type="number" on:input={handleInput} pattern="[0-9]" /></div>

    <div>{$_("payments.network", { values: { network: "btc" } })}</div>
    <div>{$_("payments.assetType", { values: { type: "native" } })}</div>
    <div>{$_("payments.assetName", { values: { name: "sat" } })}</div>
    <Button
        disabled={!payment_request.is_valid()}
        on:click={async () => {
            await sendMessage(payment_request.to_cmd_string())
            onClose()
        }}>{$_("payments.request")}</Button>
</div>
