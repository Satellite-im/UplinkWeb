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
                address: "/dns4/nyc-3-dev.relay.satellite.im/tcp/4410/wss/p2p/12D3KooWKmRupXFyBqJtm6FAySPe6Krmi6v5i6SsQ96NMZ9J4Nns",
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
