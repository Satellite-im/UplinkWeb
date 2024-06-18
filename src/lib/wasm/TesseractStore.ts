import { log } from "$lib/utils/Logger"
import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"

/**
 * Class representing the TesseractStore, which manages the state and interactions with a Tesseract instance.
 */
class TesseractStore {
    private tesseractWritable: Writable<wasm.Tesseract | null> = writable(null)

    /**
     * Retrieves the Tesseract instance.
     * @returns {Promise<wasm.Tesseract>} A promise that resolves to the Tesseract instance.
     */
    async getTesseract(): Promise<wasm.Tesseract> {
        return get(this.tesseractWritable)!
    }

    /**
     * Unlocks the Tesseract using the provided pin.
     * @param {string} pin - The pin to unlock the Tesseract.
     */
    async unlock(pin: string) {
        await init()
        log.debug("TesseractStore: Warp WASM initialized")
        const tesseractInstance = new wasm.Tesseract()
        this.tesseractWritable.set(tesseractInstance)

        const encoder = new TextEncoder()
        const passphrase = encoder.encode(pin)

        try {
            await tesseractInstance.load_from_storage()
            await tesseractInstance.unlock(passphrase)

            if (!tesseractInstance.autosave_enabled()) {
                tesseractInstance.set_autosave()
            }

            log.info("Tesseract: " + tesseractInstance)
        } catch (error) {
            log.error("Error unlocking Tesseract: " + error)
        }
    }

    /**
     * Locks the Tesseract instance.
     */
    lock() {
        const tesseractInstance = get(this.tesseractWritable)
        if (tesseractInstance) {
            tesseractInstance.lock()
        }
    }
}

export const TesseractStoreInstance = new TesseractStore()
