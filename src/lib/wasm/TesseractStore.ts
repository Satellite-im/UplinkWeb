import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { log } from "$lib/utils/Logger"
import { MultipassStoreInstance } from "./MultipassStore"
import { failure, success, type Result } from "$lib/utils/Result"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { initWarp } from "./IWarp"

/**
 * Class representing the TesseractStore, which manages the state and interactions with a Tesseract instance.
 */
class TesseractStore {
    private tesseractWritable: Writable<wasm.Tesseract | null>

    constructor() {
        this.tesseractWritable = writable(null)
    }

    /**
     * Retrieves the Tesseract instance.
     * @returns {wasm.Tesseract} The current Tesseract instance.
     */
    async getTesseract(): Promise<wasm.Tesseract> {
        let tesseract = get(this.tesseractWritable)!
        return tesseract
    }

    /**
     * Unlocks the Tesseract using the provided pin.
     * @param {string} pin - The pin to unlock the Tesseract.
     */
    async unlock(pin: string): Promise<Result<WarpError, void>> {
        const tesseract = get(this.tesseractWritable)

        const encoder = new TextEncoder()
        const passphrase = encoder.encode(pin)

        try {
            if (tesseract) {
                tesseract.unlock(passphrase)

                log.info("Tesseract Unlocked: " + tesseract)
                return success(undefined)
            }
            return failure(handleErrors(new Error("Tesseract not initialized")))
        } catch (error) {
            log.error("Error unlocking Tesseract: " + error)
            return failure(handleErrors(error))
        }
    }

    /**
     * Locks the Tesseract instance.
     */
    lock() {
        const tesseract = get(this.tesseractWritable)
        if (tesseract) {
            tesseract.lock()
        }
    }

    exists() {
        const tesseract = get(this.tesseractWritable)
        return tesseract?.exist("keypair")
    }

    async initTesseract(from?: wasm.Tesseract) {
        if (from) {
            this.tesseractWritable.set(from)
            return
        }
        let tesseract = get(this.tesseractWritable)
        if (tesseract === null) this.tesseractWritable.set(await createTesseract())
    }
}

export async function createTesseract(): Promise<wasm.Tesseract> {
    await initWarp()
    let tesseract = new wasm.Tesseract()
    tesseract.load_from_storage()
    tesseract.set_autosave()
    return tesseract
}

export const TesseractStoreInstance = new TesseractStore()
