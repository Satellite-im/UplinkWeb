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

    let inputAmount = ""

    function onInputAmount() {
        //remove any input that is not a number or a dot
        inputAmount = inputAmount.replace(/[^0-9.]/g, "")
        //if there is more than 1 dot, only keep the first one
        if (inputAmount.split(".").length > 2) {
            let i = inputAmount.indexOf(".")
            inputAmount = inputAmount.substring(0, i + 1) + inputAmount.substring(i + 1, inputAmount.length).replace(".", "")
        }

        //convert string amount to bigint
        wallet.toBigIntAmount(transfer.asset, inputAmount).then(amount => {
            transfer.amount = amount
            wallet.toAmountPreviewString(transfer.asset, transfer.amount).then(amountPreview => {
                transfer.amountPreview = amountPreview
            })
        })
    }
    onInputAmount()
    function onChangeAssetKind() {
        transfer.asset.id = ""
        transfer.amount = BigInt(0)
        onInputAmount()
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
        <div>{$_("payments.assetId") + ":"}<input bind:value={transfer.asset.id} on:change={onInputAmount} /></div>
    {/if}
    <div>{transfer.amountPreview}</div>
    <div>{$_("payments.amount") + ":"} <input bind:value={inputAmount} type="text" on:input={onInputAmount} /></div>
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
