import { createPersistentState } from "$lib/state/db/persistedState"
import init, * as wasm from "warp-wasm"
import type { IWarp } from "./IWarp"

class Store {
    warp: IWarp

    constructor() {
        this.warp = {
            tesseract: createPersistentState("warp.tesseract", null),
            multipass: createPersistentState("warp.multipass", null),
            raygun: createPersistentState("warp.raygun", null),
            constellation: createPersistentState("warp.constellation", null),
        }
    }

    async clear() {
        this.warp.tesseract.set(null)
        this.warp.multipass.set(null)
        this.warp.raygun.set(null)
        this.warp.constellation.set(null)
    }

    async initWarpInstances(tesseract: wasm.Tesseract, addresses?: string[]) {
        await init()
        let warp_instance = await this.createIpfs(tesseract, addresses)
        this.warp.tesseract.set(tesseract)
        this.warp.multipass.set(warp_instance.multipass)
        this.warp.raygun.set(warp_instance.raygun)
        this.warp.constellation.set(warp_instance.constellation)
    }

    private async createIpfs(tesseract: wasm.Tesseract, addresses?: string[]) {
        if (addresses && addresses.length > 0) {
            return (await new wasm.WarpIpfs(wasm.Config.minimal_with_relay(addresses), tesseract)) as wasm.WarpInstance
        }
        // HACK: Replace 'your-relay-address-here' with your relay address
        // This is a temporary solution
        // Run this command on Warp repo to start a relay server:
        // cargo run --bin relay-server --release -- --listen-addr /ip4/127.0.0.1/tcp/4444/ws --keyfile /tmp/key.bin
        // Uncomment code below to use your local relay server
        // And comment line 52
        //return (await new wasm.WarpIpfs(wasm.Config.minimal_with_relay(["your-relay-address"]), tesseract)) as wasm.WarpInstance
        return (await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract)) as wasm.WarpInstance
    }
}

export const WarpStore = new Store()
