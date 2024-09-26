import { get, writable, Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { log } from "$lib/utils/Logger"
import { failure, success, Result } from "$lib/utils/Result"
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
                if (!tesseract.is_unlock()) return failure(handleErrors(new Error("Attempt to unlock tesseract with wrong pin")))
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

    fetchSeed() {
        const tesseract = get(this.tesseractWritable)
        if (!tesseract?.exist("mnemonic")) return undefined
        return tesseract?.retrieve("mnemonic")
    }

    removeSeed() {
        const tesseract = get(this.tesseractWritable)
        if (!tesseract?.exist("mnemonic")) return
        tesseract?._delete("mnemonic")
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
    tesseract.enable_key_check()
    return tesseract
}

export const TesseractStoreInstance = new TesseractStore()
