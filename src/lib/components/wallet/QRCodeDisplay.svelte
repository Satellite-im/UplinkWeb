<script lang="ts">
    import QRCode from "qrcode"
    import { Label, Button, Icon } from "$lib/elements"
    import { Appearance, Shape } from "$lib/enums"
    import { ToastMessage } from "$lib/state/ui/toast"
    import { Store } from "$lib/state/Store"
    import type { Currency } from "$lib/types/wallet"

    export let selectedCurrency: Currency

    let qrCodeDataURL = ""

    async function generateQRCode(address: string) {
        qrCodeDataURL = await QRCode.toDataURL(address)
    }

    $: if (selectedCurrency) {
        generateQRCode(selectedCurrency.address)
    }

    function handleCopyAddress() {
        navigator.clipboard.writeText(selectedCurrency.address)
        Store.addToastNotification(new ToastMessage("Copied", `${selectedCurrency.name} address copied.`, 3, Shape.Clipboard, Appearance.Default))
    }
</script>

<div class="qr-code-section">
    <Label text="Share QR Code" />
    <img src={qrCodeDataURL} alt="QR Code for {selectedCurrency.name} Address" />

    <Label text="or" />
    <Button appearance={Appearance.Alt} on:click={handleCopyAddress} text="Copy Address">
        <Icon icon={Shape.Clipboard} />
    </Button>
</div>

<style lang="scss">
    .qr-code-section {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        padding-top: var(--gap);
        border-top: var(--border-width) solid var(--border-color);
        gap: var(--gap);

        img {
            width: 80%;
            border-radius: var(--border-radius);
        }
    }
</style>
