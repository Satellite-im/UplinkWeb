import { type Writable } from "svelte/store"
import { createPersistentState } from ".."

export interface IWalletState {
    open: Writable<boolean>
    balance: Writable<number>
    position: Writable<WalletPosition>
}

export type WalletPosition = [number, number]

class Store {
    state: IWalletState

    constructor() {
        this.state = {
            open: createPersistentState("uplink.wallet.open", false),
            balance: createPersistentState("uplink.wallet.balance", 12345),
            position: createPersistentState("uplink.wallet.position", [0, 0]),
        }
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
