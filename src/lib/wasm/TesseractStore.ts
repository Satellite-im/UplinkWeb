import { Store } from "$lib/state/store"
import { Logger } from "$lib/utils/Logger"
import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"

class TesseractStore {
    private tesseractWritable: Writable<wasm.Tesseract | null> = writable(null)

    async getTesseract(): Promise<wasm.Tesseract> {
        return get(this.tesseractWritable)!
    }

    async unlock(pin: string) {
        await init()
        let store = get(Store.state.logger)
        if (store.debug == null) {
            Store.state.logger.set(new Logger({ relay_to_js_console: true }))
            store = get(Store.state.logger)
            store.warn(`Logger was not initialized properly. Initialized Logger. (This only seems to happen when we don't clear the data)`)
        }
        store.debug('TesseractStore: Warp WASM initialized')
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

            get(Store.state.logger).info('Tesseract: ' + tesseractInstance)
        } catch (error) {
            get(Store.state.logger).error('Error unlocking Tesseract: ' + error)
        }
    }

    lock() {
        const tesseractInstance = get(this.tesseractWritable)
        if (tesseractInstance) {
            tesseractInstance.lock()
        }
    }
}

export const TesseractStoreInstance = new TesseractStore()
