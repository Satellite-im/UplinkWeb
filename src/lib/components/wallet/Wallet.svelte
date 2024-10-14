<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import Toolbar from "./Toolbar.svelte"
    import CurrencySelector from "./CurrencySelector.svelte"
    import BalanceDisplay from "./BalanceDisplay.svelte"
    import ActionButtons from "./ActionButtons.svelte"
    import QRCodeDisplay from "./QRCodeDisplay.svelte"
    import QRScanner from "./QRScanner.svelte"
    import { Appearance, Shape } from "$lib/enums"
    import { Button, Icon } from "$lib/elements"
    import Input from "$lib/elements/Input/Input.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { WalletStore } from "$lib/state/wallet"
    import EthereumRpc from "$lib/components/wallet/platforms/ethereum/EthereumRPC.svelte"

    export let position = { top: 50, left: 50 } // Initial position

    // View management
    enum ViewMode {
        None = "",
        Send = "send",
        Receive = "receive",
        QRScanner = "send",
    }

    let currentView: ViewMode = ViewMode.None
    let scannedQRCode = ""

    // Currency data
    interface Currency {
        name: string
        icon: Shape
        balance: number
        address: string
    }

    let currencies: Currency[] = [
        {
            name: "Starlight",
            icon: Shape.Starlight,
            balance: 12345,
            address: "z6MkqMZNLYTzkkr5JYr8jEyzKuiQmrDvjK5MZ4boECc51Nf4",
        },
        {
            name: "Ethereum",
            icon: Shape.Ethereum,
            balance: 10.5678,
            address: "eth-address-456",
        },
        {
            name: "Bitcoin",
            icon: Shape.Bitcoin,
            balance: 10.5678,
            address: "btc-address-789",
        },
    ]

    let selectedCurrency: Currency = currencies[0]

    // Reference to the root element of the component
    let container: HTMLElement
    let outsideClickListenerAdded = false

    function handleSend() {
        currentView = ViewMode.Send
        scannedQRCode = "" // Reset scanned QR code
    }

    function handleReceive() {
        currentView = ViewMode.Receive
    }

    function startQRScanner() {
        currentView = ViewMode.QRScanner
    }

    function handleQRCodeScanned(event: { detail: string }) {
        scannedQRCode = event.detail
        currentView = ViewMode.None
    }

    function handleCurrencySelected(event: { detail: Currency }) {
        selectedCurrency = event.detail
        currentView = ViewMode.None
    }

    function handleClose() {
        WalletStore.closeWallet()
    }

    function handleClickOutside(event: MouseEvent) {
        if (container && !container.contains(event.target as Node)) {
            // Call the desired function when clicked outside
            handleClose()
        }
    }

    onMount(() => {
        // Delay adding the event listener to the next event loop tick
        setTimeout(() => {
            if (!outsideClickListenerAdded) {
                document.addEventListener("mousedown", handleClickOutside)
                outsideClickListenerAdded = true
            }
        })
    })

    onDestroy(() => {
        // Clean up the event listener when the component is destroyed
        if (outsideClickListenerAdded) {
            document.removeEventListener("mousedown", handleClickOutside)
            outsideClickListenerAdded = false
        }
    })
</script>

<div bind:this={container} data-cy="wallet" class="wallet" style="top: {position.top}px; left: {position.left}px; position: absolute;">
    <!-- Toolbar -->
    <Toolbar bind:walletPosition={position} />

    <div class="header">
        <CurrencySelector currencies={currencies} bind:selectedCurrency={selectedCurrency} on:currencySelected={handleCurrencySelected} />

        <Button appearance={Appearance.Alt} on:click={handleClose} icon tooltip="History">
            <Icon icon={Shape.History} />
        </Button>
    </div>
    <EthereumRpc />

    <BalanceDisplay selectedCurrency={selectedCurrency} />
    <ActionButtons on:send={handleSend} on:receive={handleReceive} activeButton={currentView} />

    {#if currentView === ViewMode.Receive}
        <QRCodeDisplay selectedCurrency={selectedCurrency} />
    {/if}

    {#if currentView === ViewMode.QRScanner}
        <div class="send">
            <Label text="Enter Address" />
            <Input />
            <Label text="Or" />
        </div>

        <!-- QR Code Scanner -->
        <QRScanner on:scanned={handleQRCodeScanned} />
    {/if}

    <!-- Display Scanned QR Code -->
    {#if scannedQRCode}
        <div class="scanned-result">{scannedQRCode}</div>
    {/if}
</div>

<style lang="scss">
    .wallet {
        position: absolute;
        z-index: 100000;
        min-width: var(--min-component-width);
        margin: 0 auto;
        padding: var(--padding);
        background-color: var(--opaque-color);
        backdrop-filter: blur(var(--blur-radius-more));
        border-radius: var(--border-radius);
        display: inline-flex;
        flex-direction: column;
        gap: var(--gap);
        box-shadow: 0px 0px 30px 10px rgba(0, 0, 0, 0.6);

        .header {
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            gap: var(--gap);
        }

        .send {
            display: inline-flex;
            flex-direction: column;
            gap: var(--gap);
            align-items: center;
        }
    }

    .scanned-result {
        margin-top: var(--gap);
        font-size: var(--font-size);
        text-align: center;
        word-break: break-all;
    }
</style>
