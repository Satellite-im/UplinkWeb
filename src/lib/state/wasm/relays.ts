import { get, type Writable } from "svelte/store"
import { createPersistentState } from ".."

export interface RelayState {
    address: string
    active: boolean
    // Default relays cannot be edited or removed
    default?: boolean
}

class Store {
    state: Writable<{ [key: string]: RelayState }>

    constructor() {
        this.state = createPersistentState("uplink.wasm.relays", {
            // Default Relay addresses taken from warp RelayClient
            "Default US_NYC-1": {
                address: "/ip4/167.71.93.202/tcp/4445/ws/p2p/12D3KooWSsn13GxHchpG6dtr7o6ARqSkcMtsBuojgL9XU9t1M1uE",
                active: true,
                default: true,
            },
        })
    }

    getRelay(name: string): RelayState | undefined {
        let relays = get(this.state)
        return relays[name]
    }

    saveNewRelay(name: string, address: string) {
        let relays = get(this.state)
        if (name in relays) return
        relays[name] = { address, active: false }
        this.state.set(relays)
    }

    deleteRelays(names: string[]) {
        let relays = get(this.state)
        for (let name of names) {
            let current = relays[name]
            if (current && current.default) continue
            delete relays[name]
        }
        this.state.set(relays)
    }

    update(value: { [key: string]: RelayState }) {
        this.state.set(value)
    }
}

export const RelayStore = new Store()
