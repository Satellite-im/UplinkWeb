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
    BitcoinRunes = "BTC.Runes(wip)",

    Ethereum = "ETH",
    EthereumERC20 = "ETH.ERC20",

    Solana = "SOL(wip)",
    SolanaSPL = "SOL.SPL(wip)",
}

export type Asset = {
    kind: AssetType
    id: string
}

type EthWallet = {
    provider: ethers.BrowserProvider
    signer: ethers.JsonRpcSigner
}
async function getEthWallet(ethWallet: EthWallet | undefined): Promise<EthWallet> {
    if (ethWallet === undefined) {
        // Connect to the MetaMask EIP-1193 object from the browser extension (read-only)
        let provider = new ethers.BrowserProvider((window as any).ethereum)
        // Get access to write operations
        let signer = await provider.getSigner()

        ethWallet = {
            provider: provider,
            signer: signer,
        }
    }
    return ethWallet
}

function getDisplayAmount(amount: bigint, decimals: number): string {
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
    ethWallet: EthWallet | undefined

    async myAddress(asset: Asset): Promise<string> {
        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btcMyAddress()
            case AssetType.BitcoinRunes:
                return await btcRunesMyAddress()
            case AssetType.Ethereum: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethMyAddress(ethWallet)
            }
            case AssetType.EthereumERC20: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethErc20MyAddress(ethWallet)
            }
            case AssetType.Solana:
                return await solMyAddress()
            case AssetType.SolanaSPL:
                return await solSplMyAddress()
        }
    }
    async myBalance(asset: Asset): Promise<bigint> {
        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btcMyBalance()
            case AssetType.BitcoinRunes:
                return await btcRunesMyBalance(asset)
            case AssetType.Ethereum: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethMyBalance(ethWallet, await this.myAddress(asset))
            }
            case AssetType.EthereumERC20: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethErc20MyBalance(ethWallet, asset)
            }
            case AssetType.Solana:
                return await solMyBalance()
            case AssetType.SolanaSPL:
                return await solSplMyBalance(asset)
        }
    }
    async getAmountDisplay(asset: Asset, amount: bigint): Promise<string> {
        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btcGetAmountDisplay(amount)
            case AssetType.BitcoinRunes:
                return await btcRunesGetAmountDisplay(asset, amount)
            case AssetType.Ethereum:
                return await ethGetAmountDisplay(amount)
            case AssetType.EthereumERC20: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethErc20GetAmountDisplay(ethWallet, asset, amount)
            }
            case AssetType.Solana:
                return await solGetAmountDisplay(amount)
            case AssetType.SolanaSPL:
                return await solSplGetAmountDisplay(asset, amount)
        }
    }
    async transfer(asset: Asset, amount: bigint, toAddress: string) {
        switch (asset.kind) {
            case AssetType.Bitcoin: {
                return await btcTransfer(amount, toAddress)
            }
            case AssetType.BitcoinRunes:
                return await btcRunesTransfer(asset, amount, toAddress)
            case AssetType.Ethereum: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethTransfer(ethWallet, amount, toAddress)
            }
            case AssetType.EthereumERC20: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethErc20Transfer(ethWallet, asset, amount, toAddress)
            }
            case AssetType.Solana:
                return await solTransfer(amount, toAddress)
            case AssetType.SolanaSPL:
                return await solSplTransfer(asset, amount, toAddress)
        }
    }
}

async function btcMyAddress(): Promise<string> {
    const response = await Wallet.request("getAccounts", {
        purposes: [AddressPurpose.Payment],
    })
    if (response.status !== "success") {
        log.error("failed to get accounts")
        return ""
    }
    if (response.result.length < 1) {
        log.error("no account exists")
        return ""
    }
    return response.result[0].address
}

async function btcMyBalance(): Promise<bigint> {
    const response = await Wallet.request("getBalance", undefined)
    if (response.status === "success") {
        console.log(response.result)
        return BigInt(response.result.total)
    } else {
        console.error(response.error)
        return BigInt(0)
    }
}

async function btcGetAmountDisplay(amount: bigint): Promise<string> {
    return getDisplayAmount(amount, 8) + " BTC"
}

async function btcTransfer(amount: bigint, toAddress: string) {
    try {
        const response = await Wallet.request("sendTransfer", {
            recipients: [
                {
                    address: toAddress,
                    amount: Number(amount),
                },
            ],
        })
        if (response.status === "success") {
            log.info("btc transfer successful")
        } else {
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                log.warn(response.error.message)
            } else {
                log.error(response.error.message)
            }
        }
    } catch (err) {
        console.error(err)
    }
}

async function btcRunesMyAddress(): Promise<string> {
    const response = await Wallet.request("getAccounts", {
        purposes: [AddressPurpose.Ordinals],
    })
    if (response.status !== "success") {
        log.error("failed to get accounts")
        return ""
    }
    if (response.result.length < 1) {
        log.error("no account exists")
        return ""
    }
    return response.result[0].address
}

async function btcRunesMyBalance(asset: Asset): Promise<bigint> {
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

async function btcRunesGetAmountDisplay(asset: Asset, amount: bigint): Promise<string> {
    return getDisplayAmount(amount, 0) + " " + asset.id
}

async function btcRunesTransfer(asset: Asset, amount: bigint, toAddress: string) {
    try {
        const response = await Wallet.request("runes_transfer", {
            recipients: [
                {
                    runeName: "UNCOMMON•GOODS",
                    amount: amount.toString(),
                    address: toAddress,
                },
            ],
        })

        if (response.status === "success") {
            log.info("btc runes transfer successful")
        } else {
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                log.warn(response.error.message)
            } else {
                log.error(response.error.message)
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function ethMyAddress(ethWallet: EthWallet): Promise<string> {
    let addresses = await ethWallet.provider.send("eth_requestAccounts", [])
    let activeAddress = addresses[0]
    return activeAddress
}

async function ethMyBalance(ethWallet: EthWallet, myAddress: string): Promise<bigint> {
    return await ethWallet.provider.getBalance(myAddress)
}

async function ethGetAmountDisplay(amount: bigint): Promise<string> {
    return getDisplayAmount(amount, 18) + " ETH"
}

async function ethTransfer(ethWallet: EthWallet, amount: bigint, toAddress: string) {
    let tx = await ethWallet.signer.sendTransaction({
        to: toAddress,
        value: amount,
    })
}

async function ethErc20MyAddress(ethWallet: EthWallet): Promise<string> {
    return await ethMyAddress(ethWallet)
}

async function ethErc20MyBalance(ethWallet: EthWallet, asset: Asset): Promise<bigint> {
    let abi = ["function balanceOf(address addr) view returns (uint)"]
    let contract = new ethers.Contract(asset.id, abi, ethWallet.provider)
    let balance = await contract.balanceOf(await ethMyAddress(ethWallet))
    return BigInt(balance)
}

async function ethErc20GetAmountDisplay(ethWallet: EthWallet, asset: Asset, amount: bigint): Promise<string> {
    if (asset.id === "") {
        return amount.toString()
    }
    let abi = ["function decimals() view returns (uint8)", "function symbol() view returns (string)"]
    let contract = new ethers.Contract(asset.id, abi, ethWallet.provider)
    let decimals: number = Number(await contract.decimals())
    let symbol: string = await contract.symbol()
    return getDisplayAmount(amount, decimals) + " " + symbol
}

async function ethErc20Transfer(ethWallet: EthWallet, asset: Asset, amount: bigint, toAddress: string) {
    let abi = ["function transfer(address to, uint amount)"]
    let contract = new ethers.Contract(asset.id, abi, ethWallet.signer)
    let tx = await contract.transfer(toAddress, amount)
    await tx.wait()
}

async function solMyAddress(): Promise<string> {
    log.error("solMyAddress: SOL not yet supported")
    return ""
}

async function solMyBalance(): Promise<bigint> {
    log.error("solMyBalance: SOL not yet supported")
    return BigInt(0)
}

async function solGetAmountDisplay(amount: bigint): Promise<string> {
    log.error("solGetAmountDisplay: SOL not yet supported")
    return ""
}

async function solTransfer(amount: bigint, toAddress: string) {
    log.error("solTransfer: SOL not yet supported")
}

async function solSplMyAddress(): Promise<string> {
    log.error("solSplMyAddress: SOL not yet supported")
    return ""
}

async function solSplMyBalance(asset: Asset): Promise<bigint> {
    log.error("solSplMyBalance: SOL not yet supported")
    return BigInt(0)
}

async function solSplGetAmountDisplay(asset: Asset, amount: bigint): Promise<string> {
    log.error("solSplGetAmountDisplay: SOL not yet supported")
    return ""
}

async function solSplTransfer(asset: Asset, amount: bigint, toAddress: string) {
    log.error("solSplTransfer: SOL not yet supported")
}

export class Transfer {
    asset: Asset
    amount: bigint
    toAddress: string

    constructor() {
        this.asset = { kind: AssetType.Bitcoin, id: "" }
        this.amount = BigInt(0)
        this.toAddress = ""
    }
    isValid(): boolean {
        if (this.asset.kind !== undefined && this.toAddress !== "" && this.amount > 0) {
            if (this.asset.kind === AssetType.BitcoinRunes && this.asset.id === "") {
                return false
            }
            if (this.asset.kind === AssetType.EthereumERC20 && this.asset.id === "") {
                return false
            }
            if (this.asset.kind === AssetType.SolanaSPL && this.asset.id === "") {
                return false
            }
            return true
        }
        return false
    }
    toCmdString(): string {
        let id = this.asset.id === "" ? "n/a" : this.asset.id
        return `/request ${this.asset.kind} ${id} ${this.amount} ${this.toAddress}`
    }
    toDisplayString(): string {
        let id = this.asset.id === "n/a" ? "" : this.asset.id
        return `Send ${this.amount} ${this.asset.kind}: ${id} to ${shortenAddr(this.toAddress, 6)}`
    }
    async execute() {
        if (this.isValid()) {
            await wallet.transfer(this.asset, this.amount, this.toAddress)
        }
    }
}

export function getValidPaymentRequest(msg: string): Transfer | undefined {
    let parts = msg.split(" ")
    if (parts.length === 5 && parts[0] === "/request") {
        let request = new Transfer()
        request.asset = { kind: parts[1] as AssetType, id: parts[2] }
        request.amount = BigInt(parts[3])
        request.toAddress = parts[4]
        if (request.isValid()) {
            return request
        }
    }
}

export function shortenAddr(str: string, numChars: number): string {
    let start = str.substring(0, numChars)
    let end = str.substring(str.length - numChars)
    return start + ".." + end
}

export const wallet = new ExternalWallets()
