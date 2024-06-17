import { Store } from "$lib/state/store";
import { get, writable, type Writable } from "svelte/store";
import * as wasm from "warp-wasm";
import { WarpStore } from "./WarpStore";

/**
 * Class representing the TesseractStore, which manages the state and interactions with a Tesseract instance.
 */
class TesseractStore {
    private tesseractWritable: Writable<wasm.Tesseract | null> = writable(null);

    constructor(tesseract: Writable<wasm.Tesseract | null>) {
        this.tesseractWritable = tesseract;
    }

    /**
     * Retrieves the Tesseract instance.
     * @returns {Promise<wasm.Tesseract>} A promise that resolves to the Tesseract instance.
     */
    async getTesseract(): Promise<wasm.Tesseract> {
        return get(this.tesseractWritable)!;
    }

    /**
     * Unlocks the Tesseract using the provided pin.
     * @param {string} pin - The pin to unlock the Tesseract.
     */
    async unlock(pin: string) {
        const tesseract = get(this.tesseractWritable);

        const encoder = new TextEncoder();
        const passphrase = encoder.encode(pin);

        try {
            if (tesseract) {
                await tesseract.unlock(passphrase);
    
                if (!tesseract.autosave_enabled()) {
                    tesseract.set_autosave();
                }
    
                get(Store.state.logger).info('Tesseract: ' + tesseract);
            }
        } catch (error) {
            get(Store.state.logger).error('Error unlocking Tesseract: ' + error);
        }
    }

    /**
     * Locks the Tesseract instance.
     */
    lock() {
        const tesseract = get(this.tesseractWritable);
        if (tesseract) {
            tesseract.lock();
        }
    }
}

export const TesseractStoreInstance = new TesseractStore(WarpStore.warp.tesseract);
