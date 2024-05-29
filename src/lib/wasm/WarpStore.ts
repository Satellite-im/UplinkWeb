import { createPersistentState } from "$lib/state/db/persistedState"
import init, * as wasm from "warp-wasm"
import type { IWarp } from "./IWarp"

class Store {
    warp: IWarp

    constructor() {
        this.warp = {
            tesseract: createPersistentState('warp.tesseract', null),
            multipass: createPersistentState('warp.multipass', null),
            raygun: createPersistentState('warp.raygun', null),
            constellation: createPersistentState('warp.constellation', null),
        }
    }

    async initWarpInstances(
        tesseract: wasm.Tesseract
    ) {
        await init()
        let warp_instance = await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract) as wasm.WarpInstance
        this.warp.tesseract.set(tesseract)
        this.warp.multipass.set(warp_instance.multipass)
        this.warp.raygun.set(warp_instance.raygun)
        this.warp.constellation.set(warp_instance.constellation)
    }
}

export const WarpStore = new Store()