import Wallet, { AddressPurpose, AddressType, RpcErrorCode } from "sats-connect"
import { ethers } from "ethers"
import { log } from "./Logger"
import { PaymentRequestsEnum } from "$lib/enums"
import type { MessageType } from "warp-wasm"

export type Account = {
    address: string
    publicKey: string
    purpose: AddressPurpose
    addressType: AddressType
}

export enum AssetType {
    None = "Select an asset",
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

function toAmountPreviewString(amount: bigint, decimals: number): string {
    if (decimals > 0) {
        let num = amount.toString().padStart(decimals + 1, "0")
        let integer = num.substring(0, num.length - decimals)
        let fraction = num.substring(num.length - decimals, num.length)
        return integer + "." + fraction
    } else {
        return amount.toString()
    }
}

function toBigIntAmount(amount: string, decimals: number): bigint {
    //check if the amount string is valid. it should only contain numbers and at most one dot.
    if (amount.match(/[^0-9.]/g) || amount.split(".").length > 2) {
        return BigInt(0)
    }

    //get the position of the decimal and split amount into fraction and integer
    let integer = ""
    let fraction = ""
    let i = amount.indexOf(".")
    if (i === -1) {
        integer = amount
    } else {
        integer = amount.substring(0, i)
        fraction = amount.substring(i + 1, amount.length)
    }

    //make fraction the appropriate length according to number of decimals
    if (fraction.length > decimals) {
        fraction = fraction.substring(0, decimals)
    } else {
        fraction = fraction.padEnd(decimals, "0")
    }

    //concat integer and fraction and convert to bigint
    return BigInt(integer + fraction)
}

class ExternalWallets {
    ethWallet: EthWallet | undefined

    async myAddress(asset: Asset): Promise<string> {
        if (asset.kind === AssetType.None) {
            throw new Error("Please select an asset before retrieving the address")
        }

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
        if (asset.kind === AssetType.None) {
            throw new Error("Please select an asset before checking the balance")
        }

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

    async toAmountPreviewString(asset: Asset, amount: bigint): Promise<string> {
        if (asset.kind === AssetType.None) {
            throw new Error("Please select an asset before formatting the amount")
        }

        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btcToAmountPreviewString(amount)
            case AssetType.BitcoinRunes:
                return await btcRunesToAmountPreviewString(asset, amount)
            case AssetType.Ethereum:
                return await ethToAmountPreviewString(amount)
            case AssetType.EthereumERC20: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethErc20ToAmountPreviewString(ethWallet, asset, amount)
            }
            case AssetType.Solana:
                return await solToAmountPreviewString(amount)
            case AssetType.SolanaSPL:
                return await solSplToAmountPreviewString(asset, amount)
        }
    }

    async toBigIntAmount(asset: Asset, amount: string): Promise<bigint> {
        if (asset.kind === AssetType.None) {
            throw new Error("Please select an asset before formatting the amount")
        }

        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btcToBigIntAmount(amount)
            case AssetType.BitcoinRunes:
                return await btcRunesToBigIntAmount(asset, amount)
            case AssetType.Ethereum:
                return await ethToBigIntAmount(amount)
            case AssetType.EthereumERC20: {
                let ethWallet = await getEthWallet(this.ethWallet)
                this.ethWallet = ethWallet
                return await ethErc20ToBigIntAmount(ethWallet, asset, amount)
            }
            case AssetType.Solana:
                return await solToBigIntAmount(amount)
            case AssetType.SolanaSPL:
                return await solSplToBigIntAmount(asset, amount)
        }
    }

    async transfer(asset: Asset, amount: bigint, toAddress: string) {
        if (asset.kind === AssetType.None) {
            throw new Error("Please select an asset before performing a transfer")
        }

        switch (asset.kind) {
            case AssetType.Bitcoin:
                return await btcTransfer(amount, toAddress)
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

async function btcToAmountPreviewString(amount: bigint): Promise<string> {
    return toAmountPreviewString(amount, 8) + " BTC"
}

async function btcToBigIntAmount(amount: string): Promise<bigint> {
    return toBigIntAmount(amount, 8)
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

async function btcRunesToAmountPreviewString(asset: Asset, amount: bigint): Promise<string> {
    return toAmountPreviewString(amount, 0) + " " + asset.id
}

async function btcRunesToBigIntAmount(asset: Asset, amount: string): Promise<bigint> {
    return toBigIntAmount(amount, 0)
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

async function ethToAmountPreviewString(amount: bigint): Promise<string> {
    return toAmountPreviewString(amount, 18) + " ETH"
}

async function ethToBigIntAmount(amount: string): Promise<bigint> {
    return toBigIntAmount(amount, 18)
}

async function ethTransfer(ethWallet: EthWallet, amount: bigint, toAddress: string) {
    return await ethWallet.signer.sendTransaction({
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

async function ethErc20ToAmountPreviewString(ethWallet: EthWallet, asset: Asset, amount: bigint): Promise<string> {
    if (asset.id === "") {
        return amount.toString()
    }
    let abi = ["function decimals() view returns (uint8)", "function symbol() view returns (string)"]
    let contract = new ethers.Contract(asset.id, abi, ethWallet.provider)
    let decimals: number = Number(await contract.decimals())
    let symbol: string = await contract.symbol()
    return toAmountPreviewString(amount, decimals) + " " + symbol
}

async function ethErc20ToBigIntAmount(ethWallet: EthWallet, asset: Asset, amount: string): Promise<bigint> {
    if (asset.id === "") {
        return BigInt(0)
    }
    let abi = ["function decimals() view returns (uint8)", "function symbol() view returns (string)"]
    let contract = new ethers.Contract(asset.id, abi, ethWallet.provider)
    let decimals: number = Number(await contract.decimals())
    let symbol: string = await contract.symbol()
    return toBigIntAmount(amount, decimals)
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

async function solToAmountPreviewString(amount: bigint): Promise<string> {
    log.error("solGetAmountDisplay: SOL not yet supported")
    return ""
}

async function solToBigIntAmount(amount: string): Promise<bigint> {
    log.error("solToBigIntAmount: SOL not yet supported")
    return BigInt(0)
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

async function solSplToAmountPreviewString(asset: Asset, amount: bigint): Promise<string> {
    log.error("solSplGetAmountDisplay: SOL not yet supported")
    return ""
}

async function solSplToBigIntAmount(asset: Asset, amount: string): Promise<bigint> {
    log.error("solSplToBigIntAmount: SOL not yet supported")
    return BigInt(0)
}

async function solSplTransfer(asset: Asset, amount: bigint, toAddress: string) {
    log.error("solSplTransfer: SOL not yet supported")
}

export class Transfer {
    asset: Asset
    amount: bigint
    toAddress: string
    amountPreview: string
    id: string

    constructor() {
        this.asset = { kind: AssetType.None, id: "" }
        this.amount = BigInt(0)
        this.toAddress = ""
        this.amountPreview = ""
        this.id = ""
    }

    isValid(): boolean {
        if (this.asset.kind !== AssetType.None && this.toAddress !== "" && this.amount > 0) {
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
        let transfer = JSON.stringify(this, (k, v) => (k === "amount" && typeof v === "bigint" ? v.toString() : v))
        console.log(transfer)
        return `/request ${transfer}`
    }

    toRejectString(id: string) {
        const transfer = JSON.stringify(this, (key, value) => (key === "amount" && typeof value === "bigint" ? value.toString() : value))
        return `/reject ${id} {"details":${transfer}}`
    }

    toDisplayString(kind: string, amount: string, toAddress: string, messageId?: string): string {
        const transfer = JSON.stringify(this, (key, value) => (key === "amount" && typeof value === "bigint" ? value.toString() : value))
        const message = {
            kind,
            details: {
                amount,
                toAddress,
                messageID: messageId,
                transfer: JSON.parse(transfer),
            },
        }
        return `/send ${JSON.stringify(message)}`
    }

    async execute() {
        if (this.isValid()) {
            let verifyTansfer = await wallet.transfer(this.asset, this.amount, this.toAddress)
            if (verifyTansfer === undefined) {
                return false
            } else {
                return true
            }
        }
    }
}

export function getValidPaymentRequest(msg: string, msgId?: string): Transfer | undefined {
    let transfer = new Transfer()
    if (msg.startsWith(PaymentRequestsEnum.Request)) {
        let json = msg.substring(PaymentRequestsEnum.Request.length, msg.length).trim()
        try {
            let parsed = JSON.parse(json, (k, v) => (k === "amount" && typeof v === "string" ? BigInt(v) : v))
            transfer.asset = parsed.asset
            transfer.amount = parsed.amount
            transfer.toAddress = parsed.toAddress
            transfer.amountPreview = parsed.amountPreview
        } catch (err) {
            console.log("Parse Failed", err)
        }
        if (transfer.asset.kind !== AssetType.None && transfer.isValid()) {
            return transfer
        }
    } else if (msg.startsWith(PaymentRequestsEnum.Reject)) {
        let json = msg.substring(PaymentRequestsEnum.Reject.length, msg.length).trim()

        if (json.startsWith("{")) {
            try {
                let parsed = JSON.parse(json, (k, v) => (k === "amount" && typeof v === "string" ? BigInt(v) : v))
                transfer.asset = parsed.asset
                transfer.amount = parsed.amount
                transfer.toAddress = parsed.toAddress
                transfer.amountPreview = parsed.amountPreview
            } catch (err) {
                console.error("Parse Failed", err)
            }
        } else {
            console.error("Reject message is not JSON, possibly an ID or UUID:", json)
            return undefined
        }

        if (transfer.asset.kind !== AssetType.None && transfer.isValid()) {
            return transfer
        }
    } else if (msg.startsWith(PaymentRequestsEnum.Send)) {
        let json = msg.substring(PaymentRequestsEnum.Send.length).trim()
        let jsonStartIndex = json.indexOf("{")
        if (jsonStartIndex !== -1) {
            json = json.substring(jsonStartIndex).trim()
            try {
                let parsed = JSON.parse(json, (key, value) => {
                    if (key === "amount" && typeof value === "string") {
                        if (/^\d+(\.\d+)?$/.test(value)) {
                            return BigInt(Math.round(Number(value) * 1e18))
                        }
                    }
                    return value
                })
                const details = parsed.details || {}
                transfer.asset = details.asset && typeof details.asset === "object" ? details.asset : { kind: details.asset || "Unknown" }

                transfer.amount = details.amount ? BigInt(Math.round(Number(details.amount) * 1e18)) : BigInt(0)

                transfer.amountPreview = details.amount ? `${(Number(details.amount) / 1e18).toFixed(18)} ETH` : ""

                transfer.toAddress = details.toAddress || ""
            } catch (err) {
                console.error("Parse Failed", err, "JSON Input:", json)
                return undefined
            }
        } else {
            console.error("Send message is not JSON:", json)
            return undefined
        }

        if (transfer.asset && transfer.asset.kind !== undefined && transfer.asset.kind !== AssetType.None && transfer.isValid()) {
            return transfer
        } else {
            console.error("Invalid transfer object:", transfer)
            return undefined
        }
    }

    return undefined
}

export function shortenAddr(str: string, numChars: number): string {
    let start = str.substring(0, numChars)
    let end = str.substring(str.length - numChars)
    return start + ".." + end
}

export const wallet = new ExternalWallets()
