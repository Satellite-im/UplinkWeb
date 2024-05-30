import { get, type Writable } from "svelte/store"
import { createPersistentState } from ".."
import type { Frame } from "$lib/types"
import { defaultInventory } from "./default"

export interface IInventoryState {
    frames: Frame[]
}

export { defaultInventory } from "./default"

class Store {
    state: Writable<IInventoryState>

    constructor() {
        this.state = createPersistentState("uplink.inventory", defaultInventory)
    }

    loadMockData() {
        this.state.set({ ...get(this.state), frames: defaultInventory.frames })
    }
}

export const InventoryStore = new Store()
