<script lang="ts">
    import { ethers, BrowserProvider } from "ethers"
    import { MetaMaskInpageProvider } from "@metamask/providers"
    import Icon from "$lib/elements/Icon.svelte"
    import { Appearance, Shape, Size } from "$lib/enums"
    import Label from "$lib/elements/Label.svelte"

    // Type assertion for window.ethereum
    const { ethereum } = window as typeof window & {
        ethereum?: MetaMaskInpageProvider
    }

    let signer: ethers.JsonRpcSigner | null = null
    let browserProvider: BrowserProvider | null = null

    async function initializeProvider() {
        if (typeof ethereum === "undefined") {
            console.log("MetaMask not installed; using read-only defaults")
        } else {
            browserProvider = new BrowserProvider(ethereum)

            try {
                await ethereum.request({ method: "eth_requestAccounts" })
                signer = await browserProvider.getSigner()

                console.log("Signer address:", await signer.getAddress())
            } catch (error) {
                console.error("An error occurred while accessing the signer:", error)
            }
        }
    }

    initializeProvider()
</script>

<div class="provider-status">
    <Icon icon={Shape.Circle} size={Size.Small} filled highlight={browserProvider ? Appearance.Success : Appearance.Alt} />
    <Label text={browserProvider ? "RPC Connected" : "Read-Only"} />
</div>

<style lang="scss">
    .provider-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
        flex: 1;
    }
</style>
