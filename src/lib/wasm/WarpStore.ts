import * as wasm from "warp-wasm"
import { initWarp, type IWarp } from "./IWarp"
import { get, writable } from "svelte/store"
import { log } from "$lib/utils/Logger"
import { TesseractStoreInstance } from "./TesseractStore"
import { createLock } from "./AsyncLock"
import { AuthStore } from "$lib/state/auth"

/**
 * Class representing the Store, which manages the state and interactions with Warp instances.
 */
class Store {
    warp: IWarp

    /**
     * Creates an instance of Store and initializes persistent states for Warp components.
     */
    constructor() {
        this.warp = {
            tesseract: writable<wasm.Tesseract | null>(null),
            multipass: writable<wasm.MultiPassBox | null>(null),
            raygun: writable<wasm.RayGunBox | null>(null),
            constellation: writable<wasm.ConstellationBox | null>(null),
        }
    }

    /**
     * Initializes Warp instances with the provided Tesseract and optional addresses.
     * @param tesseract - The Tesseract instance to use.
     * @param addresses - Optional addresses for IPFS configuration.
     */
    async initWarpInstances(addresses?: string[], override?: boolean) {
        const multipassInstance = get(this.warp.multipass)

        if (!override && multipassInstance !== null) {
            log.info("Warp instances already initialized. Returning.")
            return
        }
        await initWarp()
        let warp_instance = await this.createIpfs(addresses)
        let tesseract = warp_instance.multipass.tesseract()
        let locked = createLock(warp_instance)
        // After passing tesseract to Ipfs the current ref is consumed so we fetch it from Ipfs again
        TesseractStoreInstance.initTesseract(tesseract)
        this.warp.tesseract.set(tesseract)
        this.warp.multipass.set(locked.subLock(w => w.multipass))
        this.warp.raygun.set(locked.subLock(w => w.raygun))
        this.warp.constellation.set(locked.subLock(w => w.constellation))
    }

    /**
     * Creates an IPFS instance with the provided Tesseract and optional addresses.
     * @param tesseract - The Tesseract instance to use.
     * @param addresses - Optional addresses for IPFS configuration.
     * @returns {Promise<wasm.WarpInstance>} A promise that resolves to a WarpInstance.
     * @private
     */
    private async createIpfs(addresses?: string[]): Promise<wasm.WarpInstance> {
        let tesseract: wasm.Tesseract = await TesseractStoreInstance.getTesseract()
        let config: wasm.Config
        if (addresses && addresses.length > 0) {
            config = wasm.Config.minimal_with_relay(addresses)
        } else {
            config = wasm.Config.minimal_basic()
        }
        config.set_save_phrase(get(AuthStore.state).saveSeedPhrase)
        config.set_thumbnail_size(500, 500)
        config.with_thumbnail_exact_format(true)
        // HACK: Replace 'your-relay-address-here' with your relay address
        // This is a temporary solution
        // Run this command on Warp repo to start a relay server:
        // cargo run --bin relay-server --release -- --listen-addr /ip4/127.0.0.1/tcp/4444/ws --keyfile /tmp/key.bin
        // Uncomment code below to use your local relay server - line 63
        // And comment line 64
        // return (await new wasm.WarpIpfs(wasm.Config.minimal_with_relay(["your-relay-address"]), tesseract)) as wasm.WarpInstance;
        return (await new wasm.WarpIpfs(config, tesseract)) as wasm.WarpInstance
    }
}

export const WarpStore = new Store()
