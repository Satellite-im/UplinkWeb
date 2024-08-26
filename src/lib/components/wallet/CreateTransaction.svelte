<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import { Store } from "$lib/state/Store"
    import { AssetType, shorten_addr, Transfer, wallet, type Asset } from "$lib/utils/Wallet"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { get } from "svelte/store"
    import { _ } from "svelte-i18n"
    import { Select } from "$lib/elements"

    export let onClose

    let transfer = new Transfer()

    async function sendMessage(text: string) {
        let chat = get(Store.state.activeChat)
        let txt = text.split("\n")
        let result = await RaygunStoreInstance.send(chat.id, txt, [])
        result.onSuccess(res => {
            ConversationStore.addPendingMessages(chat.id, res.message, txt)
        })
    }

    let display_amount = ""
    function onChangeAmount() {
        wallet.get_amount_display(transfer.asset, transfer.amount).then(display => {
            display_amount = display
        })
    }
    onChangeAmount()
    function onChangeAssetKind() {
        transfer.asset.id = ""
        transfer.amount = BigInt(0)
        onChangeAmount()
        wallet.my_address(transfer.asset).then(address => {
            transfer.to_address = address
        })
    }
    onChangeAssetKind()
</script>

<div>
    <div>{$_("payments.assetType") + ":"}<Select bind:selected={transfer.asset.kind} options={Object.values(AssetType).map(value => ({ value: value, text: value }))} on:change={onChangeAssetKind} /></div>
    {#if transfer.asset.kind === AssetType.Bitcoin_Runes || transfer.asset.kind === AssetType.Ethereum_ERC20 || transfer.asset.kind === AssetType.Solana_SPL}
        <div>{$_("payments.assetId") + ":"}<input bind:value={transfer.asset.id} on:change={onChangeAmount} /></div>
    {/if}
    <div>{display_amount}</div>
    <div>{$_("payments.amount") + ":"} <input bind:value={transfer.amount} type="number" pattern="[0-9]" on:change={onChangeAmount} /></div>
    {#if transfer.to_address !== ""}
        <div>{$_("payments.receiving_to")}: {shorten_addr(transfer.to_address, 6)}</div>
    {/if}

    <Button
        disabled={!transfer.is_valid()}
        on:click={async () => {
            await sendMessage(transfer.to_cmd_string())
            onClose()
        }}>{$_("payments.request")}</Button>
</div>
