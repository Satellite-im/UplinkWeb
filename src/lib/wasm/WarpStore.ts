import init, * as wasm from "warp-wasm";
import type { IWarp } from "./IWarp";
import { get, writable } from "svelte/store";
import { log } from "$lib/utils/Logger";

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
    async initWarpInstances(addresses?: string[]) {
        const multipassInstance = get(this.warp.multipass)
        const tesseractInstance = get(this.warp.tesseract)

        if (multipassInstance !== null && tesseractInstance !== null) {
            log.info("Warp instances already initialized. Returning.")
            return
        }

        await init();
        let warp_instance = await this.createIpfs(addresses);
        let tesseract = warp_instance.multipass.tesseract();
        this.warp.tesseract.set(tesseract);
        this.warp.multipass.set(warp_instance.multipass);
        this.warp.raygun.set(warp_instance.raygun);
        this.warp.constellation.set(warp_instance.constellation);
    }

    /**
     * Creates an IPFS instance with the provided Tesseract and optional addresses.
     * @param tesseract - The Tesseract instance to use.
     * @param addresses - Optional addresses for IPFS configuration.
     * @returns {Promise<wasm.WarpInstance>} A promise that resolves to a WarpInstance.
     * @private
     */
    private async createIpfs(addresses?: string[]): Promise<wasm.WarpInstance> {
        if (addresses && addresses.length > 0) {
            return (await new wasm.WarpIpfs(wasm.Config.minimal_with_relay(addresses))) as wasm.WarpInstance;
        }
        // HACK: Replace 'your-relay-address-here' with your relay address
        // This is a temporary solution
        // Run this command on Warp repo to start a relay server:
        // cargo run --bin relay-server --release -- --listen-addr /ip4/127.0.0.1/tcp/4444/ws --keyfile /tmp/key.bin
        // Uncomment code below to use your local relay server - line 63
        // And comment line 64
        // return (await new wasm.WarpIpfs(wasm.Config.minimal_with_relay(["your-relay-address"]), tesseract)) as wasm.WarpInstance;
        return (await new wasm.WarpIpfs(wasm.Config.minimal_basic())) as wasm.WarpInstance;
    }
}

export const WarpStore = new Store()
