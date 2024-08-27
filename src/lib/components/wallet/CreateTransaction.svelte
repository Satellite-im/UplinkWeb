<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import { Store } from "$lib/state/Store"
    import { AssetType, shortenAddr, Transfer, wallet, type Asset } from "$lib/utils/Wallet"
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

    let displayAmount = ""
    function onChangeAmount() {
        wallet.getAmountDisplay(transfer.asset, transfer.amount).then(display => {
            displayAmount = display
        })
    }
    onChangeAmount()
    function onChangeAssetKind() {
        transfer.asset.id = ""
        transfer.amount = BigInt(0)
        onChangeAmount()
        wallet.myAddress(transfer.asset).then(address => {
            transfer.toAddress = address
        })
    }
    onChangeAssetKind()

    function needsAssetId(): boolean {
        return transfer.asset.kind === AssetType.BitcoinRunes || transfer.asset.kind === AssetType.EthereumERC20 || transfer.asset.kind === AssetType.SolanaSPL
    }
</script>

<div>
    <div>{$_("payments.assetType") + ":"}<Select bind:selected={transfer.asset.kind} options={Object.values(AssetType).map(value => ({ value: value, text: value }))} on:change={onChangeAssetKind} /></div>
    {#if needsAssetId()}
        <div>{$_("payments.assetId") + ":"}<input bind:value={transfer.asset.id} on:change={onChangeAmount} /></div>
    {/if}
    <div>{displayAmount}</div>
    <div>{$_("payments.amount") + ":"} <input bind:value={transfer.amount} type="number" pattern="[0-9]" on:change={onChangeAmount} /></div>
    {#if transfer.toAddress !== ""}
        <div>{$_("payments.receiving_to")}: {shortenAddr(transfer.toAddress, 6)}</div>
    {/if}

    <Button
        disabled={!transfer.isValid()}
        on:click={async () => {
            await sendMessage(transfer.toCmdString())
            onClose()
        }}>{$_("payments.request")}</Button>
</div>
