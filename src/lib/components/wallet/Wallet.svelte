<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import Toolbar from "./Toolbar.svelte"
    import CurrencySelector from "./CurrencySelector.svelte"
    import BalanceDisplay from "./BalanceDisplay.svelte"
    import ActionButtons from "./ActionButtons.svelte"
    import QRCodeDisplay from "./QRCodeDisplay.svelte"
    import QRScanner from "./QRScanner.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import { Button, Icon } from "$lib/elements"
    import Input from "$lib/elements/Input/Input.svelte"
    import Label from "$lib/elements/Label.svelte"
    import { WalletStore } from "$lib/state/wallet"
    import EthereumRpc from "$lib/components/wallet/platforms/ethereum/EthereumRPC.svelte"
    import Switch from "$lib/elements/Switch.svelte"
    import History from "./History.svelte"
    import type { Currency } from "$lib/types"
    import { _ } from "svelte-i18n"

    export let position = { top: 50, left: 50 } // Initial position

    // View management
    enum ViewMode {
        None = "",
        Send = "send",
        Receive = "receive",
        QRScanner = "send",
        SendFunds = "SendFunds",
    }

    let currentView: ViewMode = ViewMode.None
    let scannedQRCode = ""

    let currencies: Currency[] = [
        {
            name: "Starlight",
            icon: Shape.Starlight,
            balance: 12345,
            address: "z6MkqMZNLYTzkkr5JYr8jEyzKuiQmrDvjK5MZ4boECc51Nf4",
            enabled: true,
        },
        {
            name: "Ethereum",
            icon: Shape.Ethereum,
            balance: 10.5678,
            address: "eth-address-456",
            enabled: true,
        },
        {
            name: "Bitcoin",
            icon: Shape.Bitcoin,
            balance: 10.5678,
            address: "btc-address-789",
            enabled: false,
        },
        {
            name: "Tether",
            icon: Shape.Tether,
            balance: 10.5678,
            address: "usdt-address-000",
            enabled: false,
        },
        {
            name: "USDC",
            icon: Shape.USDC,
            balance: 5672,
            address: "usdc-address-000",
            enabled: false,
        },
        {
            name: "Filecoin",
            icon: Shape.Filecoin,
            balance: 459,
            address: "fil-address-420",
            enabled: false,
        },
        {
            name: "Litecoin",
            icon: Shape.Litecoin,
            balance: 420.69,
            address: "ltc-address-420",
            enabled: false,
        },
        {
            name: "Solana",
            icon: Shape.Solana,
            balance: 44312,
            address: "sol-address-34f",
            enabled: false,
        },
    ]

    let selectedCurrency: Currency = currencies[0]
    let showHistory: boolean = false

    // Reference to the root element of the component
    let container: HTMLElement
    let outsideClickListenerAdded = false

    function handleSend() {
        currentView = ViewMode.Send
        scannedQRCode = "" // Reset scanned QR code
    }

    function sendTransaction() {}

    function handleReceive() {
        currentView = ViewMode.Receive
    }

    function handleHistory() {
        showHistory = !showHistory
    }

    function startQRScanner() {
        currentView = ViewMode.QRScanner
        showQRScanner = true
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

    // Adjust position to keep the wallet within viewport bounds
    function adjustPosition() {
        if (!container) return

        // Get the wallet's dimensions
        const walletRect = container.getBoundingClientRect()

        // Get viewport dimensions
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // Calculate new position if necessary
        let newTop = position.top
        let newLeft = position.left

        if (walletRect.right > viewportWidth) {
            newLeft = viewportWidth - walletRect.width
            if (newLeft < 0) newLeft = 0
        }

        if (walletRect.bottom > viewportHeight) {
            newTop = viewportHeight - walletRect.height
            if (newTop < 0) newTop = 0
        }

        // Update position if it has changed
        if (newTop !== position.top || newLeft !== position.left) {
            position.top = newTop
            position.left = newLeft
        }
    }
    let showQR = false
    let showQRScanner = false

    function openQRCode() {
        console.log(showQR)
        showQR = !showQR
    }

    onMount(() => {
        // Adjust position after the component has been rendered
        setTimeout(() => {
            adjustPosition()

            // Add event listener for window resize to adjust position dynamically
            window.addEventListener("resize", adjustPosition)

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

        window.removeEventListener("resize", adjustPosition)
    })
</script>

<div bind:this={container} data-cy="wallet" class="wallet" style="top: {position.top}px; left: {position.left}px;">
    <!-- Toolbar -->
    <Toolbar bind:walletPosition={position} on:close={handleClose} />

    {#if showHistory}
        <History on:close={handleHistory} />
    {/if}

    <div class="header">
        <CurrencySelector currencies={currencies} bind:selectedCurrency={selectedCurrency} on:currencySelected={handleCurrencySelected} />

        <Button appearance={Appearance.Alt} icon tooltip="History" on:click={handleHistory}>
            <Icon icon={Shape.History} />
        </Button>
    </div>

    <EthereumRpc />

    <BalanceDisplay selectedCurrency={selectedCurrency} />

    <div class="show-on-profile">
        <Label text={$_("payments.display_currency", { values: { currency: selectedCurrency.name } })} />

        <Switch small />
    </div>

    <ActionButtons on:send={handleSend} on:receive={handleReceive} activeButton={currentView} />

    {#if currentView === ViewMode.Receive}
        <QRCodeDisplay selectedCurrency={selectedCurrency} />
    {/if}

    {#if currentView === ViewMode.QRScanner}
        <Label text={$_("payments.enter_address")} />
        <Input />

        <Label text={$_("generic.or")} />

        <QRScanner on:qrCodeScanned={handleQRCodeScanned} />

        <!-- QR Code Scanner -->
        {#if showQR}
            <QRCodeDisplay selectedCurrency={selectedCurrency} />
        {/if}

        <Button appearance={Appearance.Alt} on:click={() => (currentView = ViewMode.SendFunds)} text="Send Funds"></Button>
    {/if}

    {#if currentView === ViewMode.SendFunds}
        <div class="send-funds">
            <Label text="Send <user/address> Funds" />

            <Input placeholder="Amount" />

            <Input placeholder="Note" />

            <Button appearance={Appearance.Primary} text="Complete Transaction" on:click={() => {}} />
        </div>
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
        min-width: var(--wallet-width);
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
            :global(.button) {
                width: 100%;
            }
        }
        .send-funds {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--background-alt);
            border-radius: var(--border-radius);
            border: var(--border-width) solid var(--border-color);
            gap: var(--gap);
            padding: var(--padding);
            display: inline-flex;
            flex-direction: column;
        }
        .send_address {
            display: inline-flex;
            gap: var(--gap);
            align-items: center;
        }
        .address_container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--gap);
        }
        label .address_container {
            align-self: center;
        }
        .show-on-profile {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap);
        }
    }

    .scanned-result {
        margin-top: var(--gap);
        font-size: var(--font-size);
        text-align: center;
        word-break: break-all;
    }

    .enter_address {
        display: inline-block;
        align-self: center;
        width: 100%;
    }
</style>
