<script lang="ts">
    import Button from "$lib/elements/Button.svelte"
    import { ConversationStore } from "$lib/state/conversation"
    import { Store } from "$lib/state/Store"
    import { AssetType, getValidPaymentRequest, shortenAddr, Transfer, wallet, type Asset } from "$lib/utils/Wallet"
    import { RaygunStoreInstance } from "$lib/wasm/RaygunStore"
    import { get } from "svelte/store"
    import { _ } from "svelte-i18n"
    import { Icon, Input, Label, Select, Text } from "$lib/elements"
    import { Appearance, PaymentRequestsEnum, Shape, Size } from "$lib/enums"

    export let onClose
    enum ViewMode {
        None = "",
        Send = "send",
        Receive = "receive",
        QRScanner = "send",
        SendFunds = "SendFunds",
    }
    let transfer = new Transfer()
    let sendCoin = ViewMode.None
    let initialSelect = "Select an asset"
    async function sendMessage(text: string) {
        if (sendCoin === ViewMode.Send) {
            let chat = get(Store.state.activeChat)
            let txt = text.split("\n")
            let whatReturned = await getValidPaymentRequest(txt[0])?.execute()
            if (whatReturned !== undefined) {
                let result = await RaygunStoreInstance.send(chat.id, txt, [])
                result.onSuccess(res => {
                    ConversationStore.addPendingMessages(chat.id, res.message, txt)
                })
            }
        }
        if (sendCoin === ViewMode.Receive) {
            let chat = get(Store.state.activeChat)
            let txt = text.split("\n")
            let result = await RaygunStoreInstance.send(chat.id, txt, [])
            result.onSuccess(res => {
                console.log(txt)
                ConversationStore.addPendingMessages(chat.id, res.message, txt)
            })
        }
    }

    let inputAmount = ""
    function onInputAmount() {
        isAmountTouched = true
        console.log(transfer.asset.kind)
        inputAmount = inputAmount.replace(/[^0-9.]/g, "")
        if (inputAmount.split(".").length > 2) {
            const i = inputAmount.indexOf(".")
            inputAmount = inputAmount.substring(0, i + 1) + inputAmount.substring(i + 1).replace(".", "")
        }

        const decimalPlaces = 18 // Max decimals for the asset type
        const parts = inputAmount.split(".")
        if (parts[1] && parts[1].length > decimalPlaces) {
            inputAmount = parts[0] + "." + parts[1].substring(0, decimalPlaces)
        }

        isValidAmount = /^[0-9]+(\.[0-9]+)?$/.test(inputAmount)

        if (isValidAmount) {
            wallet.toBigIntAmount(transfer.asset, inputAmount).then(amount => {
                transfer.amount = amount
                wallet.toAmountPreviewString(transfer.asset, transfer.amount).then(amountPreview => {
                    transfer.amountPreview = amountPreview
                })
            })
        }
    }

    let addressInput = ""
    let isValidAddress = false
    let isAddressTouched = false
    let isValidAmount = false
    let isAmountTouched = false
    function onAddressInput() {
        isAddressTouched = true

        const bitcoinRegex = /^(1|3|bc1|tb1)[a-zA-HJ-NP-Z0-9]{25,62}$/
        const ethereumRegex = /^0x[a-fA-F0-9]{40}$/

        isValidAddress = bitcoinRegex.test(addressInput) || ethereumRegex.test(addressInput)

        if (isValidAddress) {
            transfer.toAddress = addressInput
        }
    }

    onInputAmount()
    function onChangeAssetKind() {
        transfer.asset.id = ""
        transfer.amount = BigInt(0)
        onInputAmount()
        if (sendCoin !== ViewMode.Send) {
            wallet.myAddress(transfer.asset).then(address => {
                transfer.toAddress = address
            })
        } else {
            wallet.myAddress(transfer.asset).then(address => {
                transfer.toAddress = addressInput
            })
        }
    }
    onChangeAssetKind()

    function needsAssetId(): boolean {
        return transfer.asset.kind === AssetType.BitcoinRunes || transfer.asset.kind === AssetType.EthereumERC20 || transfer.asset.kind === AssetType.SolanaSPL
    }
</script>

<div class="payment_modal">
    <div class="title">
        <Text size={Size.Large} color="#00B894" centered hook="chat-topbar-username" class="min-text" singleLine>Transfer Funds</Text>
    </div>
    <div class="transfer_type">
        <Button
            appearance={Appearance.Alt}
            on:click={async () => {
                sendCoin = ViewMode.Send
            }}><Icon icon={Shape.DollarOut}></Icon>{$_("payments.send")}</Button>
        <Button
            appearance={Appearance.Alt}
            on:click={async () => {
                sendCoin = ViewMode.Receive
            }}><Icon icon={Shape.DollarIn}></Icon>{$_("payments.request")}</Button>
    </div>
    {#if sendCoin === ViewMode.Send}
        <div class="asset_selector">
            <Label text={$_("payments.type") + ":"}></Label>
            <Select bind:selected={transfer.asset.kind} options={Object.values(AssetType).map(value => ({ value: value, text: value }))} on:change={onChangeAssetKind} />
        </div>

        {#if transfer.asset.kind !== initialSelect}
            <div class="address">
                <Label text={$_("payments.address")} />
                <div class="address_QR">
                    <Input bind:value={addressInput} on:input={onAddressInput} />
                    {#if isAddressTouched && !isValidAddress}
                        <span class="error">Invalid wallet address.</span>
                    {/if}
                </div>
            </div>
        {/if}

        {#if isValidAddress && addressInput !== ""}
            <div class="amount">
                <Label text={$_("payments.amount")} />
                <Input bind:value={inputAmount} on:input={onInputAmount} />
                {#if isAmountTouched && !isValidAmount && inputAmount.length > 1}
                    <span class="error">Invalid amount format.</span>
                {/if}
            </div>
        {/if}

        {#if needsAssetId()}
            <div class="payment_amount">
                {$_("payments.assetId") + ":"}
                <Input bind:value={transfer.asset.id} on:change={onInputAmount} />
            </div>
        {/if}

        {#if isValidAddress && isValidAmount}
            <div class="send_button">
                <Button
                    disabled={!transfer.isValid()}
                    on:click={async () => {
                        await sendMessage(transfer.toDisplayString(transfer.asset.kind, inputAmount, transfer.toAddress))
                        onClose()
                    }}>{$_("payments.create_transaction")}</Button>
            </div>
        {/if}
    {:else if sendCoin === ViewMode.Receive}
        <div class="asset_selector">
            <Label text={$_("payments.type") + ":"}></Label><Select bind:selected={transfer.asset.kind} options={Object.values(AssetType).map(value => ({ value: value, text: value }))} on:change={onChangeAssetKind} />
        </div>
        {#if transfer.toAddress !== ""}
            <div class="address">
                <Label text={$_("payments.address")} />
                <div class="address_QR">
                    <Input value={transfer.toAddress} />
                </div>
            </div>
            <div class="amount">
                <Label text={$_("payments.amount")} />
                <Input bind:value={inputAmount} on:input={onInputAmount} />
            </div>
        {/if}

        {#if needsAssetId()}
            <div class="payment_amount">{$_("payments.assetId") + ":"}<Input bind:value={transfer.asset.id} on:change={onInputAmount} /></div>
        {/if}
        <div class="send_button">
            <Button
                disabled={!transfer.isValid()}
                on:click={async () => {
                    await sendMessage(transfer.toCmdString())
                    onClose()
                }}>{$_("payments.create_transaction")}</Button>
        </div>
    {/if}
</div>

<style lang="scss">
    .payment_modal {
        padding: var(--gap-less);
        max-width: 300px;
    }
    .title {
        gap: var(--gap-less);
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
    }
    .address {
        padding: var(--gap-less);
        display: block;
        width: 100%;
        align-items: center;
        justify-content: center;
    }
    .transfer_type {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        padding: 0 5%;
    }
    .amount {
        display: block;
        width: 100%;
        align-items: center;
        justify-content: center;
        padding: var(--gap-less);
    }
    .payment_amount {
        display: inline-flex;
        gap: var(--gap-less);
    }
    .send_button {
        display: flex;
        padding: var(--gap-less);
        :global(button) {
            width: 100%;
        }
    }
    .asset_selector {
        display: block;
        justify-content: space-between;
        align-items: center;
        padding: var(--gap-less);
    }
</style>
