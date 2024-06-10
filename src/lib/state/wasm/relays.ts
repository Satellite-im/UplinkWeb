import { get, type Writable } from "svelte/store"
import { createPersistentState } from ".."

export interface RelayState {
    address: string
    active: boolean
}

class Store {
    state: Writable<{ [key: string]: RelayState }>

    constructor() {
        this.state = createPersistentState("uplink.wasm.relays", {})
    }

    getRelay(name: string): RelayState | undefined {
        let relays = get(this.state)
        return relays[name]
    }

    saveNewRelay(name: string, address: string) {
        let relays = get(this.state)
        relays[name] = { address, active: false }
        this.state.set(relays)
    }

    deleteRelays(names: string[]) {
        let relays = get(this.state)
        for (let name of names) {
            delete relays[name]
        }
        this.state.set(relays)
    }

    update(value: { [key: string]: RelayState }) {
        this.state.set(value)
    }
}

export const RelayStore = new Store()
