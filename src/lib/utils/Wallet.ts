import Wallet, { AddressPurpose, AddressType, RpcErrorCode } from "sats-connect"
import { ethers } from "ethers"
import { log } from "./Logger"

export type Account = {
    address: string
    publicKey: string
    purpose: AddressPurpose
    addressType: AddressType
}

export enum AssetType {
    Bitcoin = "BTC",
    Bitcoin_Runes = "BTC.Runes(wip)",

    Ethereum = "ETH",
    Ethereum_ERC20 = "ETH.ERC20",

    Solana = "SOL(wip)",
    Solana_SPL = "SOL.SPL(wip)",
}

export type Asset = {
    kind: AssetType
    id: string
}

type EthWallet = {
    provider: ethers.BrowserProvider
    signer: ethers.JsonRpcSigner
}
async function get_eth_wallet(eth_wallet: EthWallet | undefined): Promise<EthWallet> {
    if (eth_wallet === undefined) {
        // Connect to the MetaMask EIP-1193 object from the browser extension (read-only)
        let provider = new ethers.BrowserProvider((window as any).ethereum)
        // Get access to write operations
        let signer = await provider.getSigner()

        eth_wallet = {
            provider: provider,
            signer: signer,
        }
    }
    return eth_wallet
}

function get_display_amount(amount: bigint, decimals: number): string {
    if (decimals > 0) {
        let num = amount.toString().padStart(decimals + 1, "0")
        let integer = num.substring(0, num.length - decimals)
        let fraction = num.substring(num.length - decimals, num.length)
        return integer + "." + fraction
    } else {
        return amount.toString()
    }
}

class ExternalWallets {
    eth_wallet: EthWallet | undefined

    async my_address(asset: Asset): Promise<string> {
        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btc_my_address()
            case AssetType.Bitcoin_Runes:
                return await btc_runes_my_address()
            case AssetType.Ethereum: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_my_address(eth_wallet)
            }
            case AssetType.Ethereum_ERC20: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_erc20_my_address(eth_wallet)
            }
            case AssetType.Solana:
                return await sol_my_address()
            case AssetType.Solana_SPL:
                return await sol_spl_my_address()
        }
    }
    async my_balance(asset: Asset): Promise<bigint> {
        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btc_my_balance()
            case AssetType.Bitcoin_Runes:
                return await btc_runes_my_balance(asset)
            case AssetType.Ethereum: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_my_balance(eth_wallet, await this.my_address(asset))
            }
            case AssetType.Ethereum_ERC20: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_erc20_my_balance(eth_wallet, asset)
            }
            case AssetType.Solana:
                return await sol_my_balance()
            case AssetType.Solana_SPL:
                return await sol_spl_my_balance(asset)
        }
    }
    async get_amount_display(asset: Asset, amount: bigint): Promise<string> {
        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btc_get_amount_display(amount)
            case AssetType.Bitcoin_Runes:
                return await btc_runes_get_amount_display(asset, amount)
            case AssetType.Ethereum:
                return await eth_get_amount_display(amount)
            case AssetType.Ethereum_ERC20: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_erc20_get_amount_display(eth_wallet, asset, amount)
            }
            case AssetType.Solana:
                return await sol_get_amount_display(amount)
            case AssetType.Solana_SPL:
                return await sol_spl_get_amount_display(asset, amount)
        }
    }
    async transfer(asset: Asset, amount: bigint, to_address: string) {
        switch (asset.kind) {
            case AssetType.Bitcoin: {
                return await btc_transfer(amount, to_address)
            }
            case AssetType.Bitcoin_Runes:
                return await btc_runes_transfer(asset, amount, to_address)
            case AssetType.Ethereum: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_transfer(eth_wallet, amount, to_address)
            }
            case AssetType.Ethereum_ERC20: {
                let eth_wallet = await get_eth_wallet(this.eth_wallet)
                this.eth_wallet = eth_wallet
                return await eth_erc20_transfer(eth_wallet, asset, amount, to_address)
            }
            case AssetType.Solana:
                return await sol_transfer(amount, to_address)
            case AssetType.Solana_SPL:
                return await sol_spl_transfer(asset, amount, to_address)
        }
    }
}

async function btc_my_address(): Promise<string> {
    const response = await Wallet.request("getAccounts", {
        purposes: [AddressPurpose.Payment],
    })
    if (response.status !== "success") {
        console.error("failed to get accounts")
        return ""
    }
    if (response.result.length < 1) {
        console.error("no account exists")
        return ""
    }
    return response.result[0].address
}

async function btc_my_balance(): Promise<bigint> {
    const response = await Wallet.request("getBalance", undefined)
    if (response.status === "success") {
        console.log(response.result)
        return BigInt(response.result.total)
    } else {
        console.error(response.error)
        return BigInt(0)
    }
}

async function btc_get_amount_display(amount: bigint): Promise<string> {
    return get_display_amount(amount, 8) + " BTC"
}

async function btc_transfer(amount: bigint, to_address: string) {
    try {
        const response = await Wallet.request("sendTransfer", {
            recipients: [
                {
                    address: to_address,
                    amount: Number(amount),
                },
            ],
        })
        if (response.status === "success") {
            // handle success
        } else {
            console.error(response.error.message)
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                // handle user cancellation error
            } else {
                // handle error
            }
        }
    } catch (err) {
        console.error(err)
    }
}

async function btc_runes_my_address(): Promise<string> {
    const response = await Wallet.request("getAccounts", {
        purposes: [AddressPurpose.Ordinals],
    })
    if (response.status !== "success") {
        console.error("failed to get accounts")
        return ""
    }
    if (response.result.length < 1) {
        console.error("no account exists")
        return ""
    }
    return response.result[0].address
}

async function btc_runes_my_balance(asset: Asset): Promise<bigint> {
    const response = await Wallet.request("runes_getBalance", null)
    if (response.status === "success") {
        console.log(response.result)
        let balance = BigInt(0)
        response.result.balances.forEach(value => {
            if (value.runeName == asset.id) {
                balance = BigInt(value.amount)
            }
        })
        return balance
    } else {
        console.error(response.error)
        return BigInt(0)
    }
}

async function btc_runes_get_amount_display(asset: Asset, amount: bigint): Promise<string> {
    return get_display_amount(amount, 0) + " " + asset.id
}

async function btc_runes_transfer(asset: Asset, amount: bigint, to_address: string) {
    try {
        const response = await Wallet.request("runes_transfer", {
            recipients: [
                {
                    runeName: "UNCOMMON•GOODS",
                    amount: amount.toString(),
                    address: to_address,
                },
            ],
        })

        if (response.status === "success") {
            // handle success
        } else {
            console.error(response.error.message)
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                // handle user cancellation error
            } else {
                // handle error
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function eth_my_address(eth_wallet: EthWallet): Promise<string> {
    let addresses = await eth_wallet.provider.send("eth_requestAccounts", [])
    let active_address = addresses[0]
    return active_address
}

async function eth_my_balance(eth_wallet: EthWallet, my_address: string): Promise<bigint> {
    return await eth_wallet.provider.getBalance(my_address)
}

async function eth_get_amount_display(amount: bigint): Promise<string> {
    return get_display_amount(amount, 18) + " ETH"
}

async function eth_transfer(eth_wallet: EthWallet, amount: bigint, to_address: string) {
    let tx = await eth_wallet.signer.sendTransaction({
        to: to_address,
        value: amount,
    })
}

async function eth_erc20_my_address(eth_wallet: EthWallet): Promise<string> {
    return await eth_my_address(eth_wallet)
}

async function eth_erc20_my_balance(eth_wallet: EthWallet, asset: Asset): Promise<bigint> {
    let abi = ["function balanceOf(address addr) view returns (uint)"]
    let contract = new ethers.Contract(asset.id, abi, eth_wallet.provider)
    let balance = await contract.balanceOf(await eth_my_address(eth_wallet))
    return BigInt(balance)
}

async function eth_erc20_get_amount_display(eth_wallet: EthWallet, asset: Asset, amount: bigint): Promise<string> {
    if (asset.id === "") {
        return amount.toString()
    }
    let abi = ["function decimals() view returns (uint8)", "function symbol() view returns (string)"]
    let contract = new ethers.Contract(asset.id, abi, eth_wallet.provider)
    let decimals: number = Number(await contract.decimals())
    let symbol: string = await contract.symbol()
    return get_display_amount(amount, decimals) + " " + symbol
}

async function eth_erc20_transfer(eth_wallet: EthWallet, asset: Asset, amount: bigint, to_address: string) {
    let abi = ["function transfer(address to, uint amount)"]
    let contract = new ethers.Contract(asset.id, abi, eth_wallet.signer)
    let tx = await contract.transfer(to_address, amount)
    await tx.wait()
}

async function sol_my_address(): Promise<string> {
    console.error("sol_my_address:", "SOL not yet supported")
    return ""
}

async function sol_my_balance(): Promise<bigint> {
    console.error("sol_my_balance:", "SOL not yet supported")
    return BigInt(0)
}

async function sol_get_amount_display(amount: bigint): Promise<string> {
    console.error("sol_get_amount_display:", "SOL not yet supported")
    return ""
}

async function sol_transfer(amount: bigint, to_address: string) {
    console.error("sol_transfer:", "SOL not yet supported")
}

async function sol_spl_my_address(): Promise<string> {
    console.error("sol_spl_my_address:", "SOL not yet supported")
    return ""
}

async function sol_spl_my_balance(asset: Asset): Promise<bigint> {
    console.error("sol_spl_my_balance:", "SOL not yet supported")
    return BigInt(0)
}

async function sol_spl_get_amount_display(asset: Asset, amount: bigint): Promise<string> {
    console.error("sol_spl_get_amount_display:", "SOL not yet supported")
    return ""
}

async function sol_spl_transfer(asset: Asset, amount: bigint, to_address: string) {
    console.error("sol_spl_transfer:", "SOL not yet supported")
}

export class Transfer {
    asset: Asset
    amount: bigint
    to_address: string

    constructor() {
        this.asset = { kind: AssetType.Bitcoin, id: "" }
        this.amount = BigInt(0)
        this.to_address = ""
    }
    is_valid(): boolean {
        if (this.asset.kind !== undefined && this.to_address !== "" && this.amount > 0) {
            if (this.asset.kind === AssetType.Bitcoin_Runes && this.asset.id === "") {
                return false
            }
            if (this.asset.kind === AssetType.Ethereum_ERC20 && this.asset.id === "") {
                return false
            }
            if (this.asset.kind === AssetType.Solana_SPL && this.asset.id === "") {
                return false
            }
            return true
        }
        return false
    }
    to_cmd_string(): string {
        let id = this.asset.id === "" ? "n/a" : this.asset.id
        return `/request ${this.asset.kind} ${id} ${this.amount} ${this.to_address}`
    }
    to_display_string(): string {
        let id = this.asset.id === "n/a" ? "" : this.asset.id
        return `Send ${this.amount} ${this.asset.kind}: ${id} to ${shorten_addr(this.to_address, 6)}`
    }
    async execute() {
        if (this.is_valid()) {
            await wallet.transfer(this.asset, this.amount, this.to_address)
        }
    }
}

export function get_valid_payment_request(msg: string): Transfer | undefined {
    let parts = msg.split(" ")
    if (parts.length === 5 && parts[0] === "/request") {
        let request = new Transfer()
        request.asset = { kind: parts[1] as AssetType, id: parts[2] }
        request.amount = BigInt(parts[3])
        request.to_address = parts[4]
        if (request.is_valid()) {
            return request
        }
    }
}

export function shorten_addr(str: string, num_chars: number): string {
    let start = str.substring(0, num_chars)
    let end = str.substring(str.length - num_chars)
    return start + ".." + end
}

export const wallet = new ExternalWallets()
