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
        // HACK: Replace 'your-relay-address-here' with your relay address
        // This is a temporary solution 
        // Run this command on Warp repo to start a relay server: 
        // cargo run --bin relay-server --release -- --listen-addr /ip4/127.0.0.1/tcp/4444/ws --keyfile /tmp/key.bin
        // Uncomment code below to use your local relay server
        // And comment line 30
        let warp_instance = await new wasm.WarpIpfs(wasm.Config.minimal_with_relay([
            '/ip4/127.0.0.1/tcp/4444/ws/p2p/12D3KooWPYK5aNLqdyXh9RiCsv1Gm8vpsJnNjp6DzBhe5Z7wT6gx'
        ]), tesseract) as wasm.WarpInstance
        // let warp_instance = await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract) as wasm.WarpInstance
        this.warp.tesseract.set(tesseract)
        this.warp.multipass.set(warp_instance.multipass)
        this.warp.raygun.set(warp_instance.raygun)
        this.warp.constellation.set(warp_instance.constellation)
    }
}

export const WarpStore = new Store()