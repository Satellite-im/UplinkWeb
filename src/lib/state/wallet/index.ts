import { type Writable, get } from "svelte/store"
import { createPersistentState } from ".."
import { keccak256, toUtf8Bytes, Wallet } from "ethers"

export interface IWalletState {
    open: Writable<boolean>
    balance: Writable<number>
    position: Writable<WalletPosition>
    accounts: Writable<WalletInfo[]>
    defaultWalletIndex: Writable<number | null>
}

export interface WalletInfo {
    wallet: Wallet
    nickname: string
}

export type WalletPosition = [number, number]

class Store {
    state: IWalletState

    constructor() {
        this.state = {
            open: createPersistentState("uplink.wallet.open", false),
            balance: createPersistentState("uplink.wallet.balance", 12345),
            position: createPersistentState("uplink.wallet.position", [0, 0]),
            accounts: createPersistentState("uplink.wallet.accounts", []),
            defaultWalletIndex: createPersistentState("uplink.wallet.defaultWalletIndex", null),
        }
    }

    async generateWallet(seed: string, nickname: string = "") {
        const hash = keccak256(toUtf8Bytes(seed))
        const wallet = new Wallet(hash)

        console.log("Public Address:", wallet.address)
        console.log("Private Key:", wallet.privateKey)

        const walletInfo: WalletInfo = {
            wallet,
            nickname,
        }

        // Add the new wallet to the accounts array in the state
        this.state.accounts.update(accounts => {
            const newAccounts = [...accounts, walletInfo]

            // If this is the first wallet, set it as default
            if (newAccounts.length === 1) {
                this.state.defaultWalletIndex.set(0)
            }

            return newAccounts
        })
    }

    // Get the default wallet from the accounts array
    getDefaultWallet(): WalletInfo | null {
        const accounts = get(this.state.accounts)
        const defaultIndex = get(this.state.defaultWalletIndex)

        if (defaultIndex !== null && defaultIndex >= 0 && defaultIndex < accounts.length) {
            return accounts[defaultIndex]
        } else {
            return null
        }
    }

    // Update the nickname of a wallet at a specific index
    setWalletNickname(index: number, nickname: string): void {
        this.state.accounts.update(accounts => {
            if (index < 0 || index >= accounts.length) {
                throw new Error("Index out of bounds")
            }

            const updatedWalletInfo = { ...accounts[index], nickname }
            const newAccounts = [...accounts]
            newAccounts[index] = updatedWalletInfo

            return newAccounts
        })
    }

    // Remove a wallet at a specific index
    removeWallet(index: number): void {
        const accounts = get(this.state.accounts)

        if (index < 0 || index >= accounts.length) {
            throw new Error("Index out of bounds")
        }

        const newAccounts = accounts.slice(0, index).concat(accounts.slice(index + 1))
        this.state.accounts.set(newAccounts)

        // Update defaultWalletIndex if necessary
        const defaultIndex = get(this.state.defaultWalletIndex)

        if (defaultIndex === index) {
            if (newAccounts.length > 0) {
                this.state.defaultWalletIndex.set(0)
            } else {
                this.state.defaultWalletIndex.set(null)
            }
        } else if (defaultIndex !== null && defaultIndex > index) {
            this.state.defaultWalletIndex.set(defaultIndex - 1)
        }
    }

    // Set the default wallet index
    setDefaultWalletIndex(index: number): void {
        const accounts = get(this.state.accounts)
        if (index < 0 || index >= accounts.length) {
            throw new Error("Index out of bounds")
        }
        this.state.defaultWalletIndex.set(index)
    }

    setTokenBalance(number: number) {
        this.state.balance.set(number)
    }

    openWallet(position: WalletPosition = [0, 0]) {
        this.state.position.set(position)
        this.state.open.set(true)
    }

    closeWallet() {
        this.state.open.set(false)
    }
}

export const WalletStore = new Store()
