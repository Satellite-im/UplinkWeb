import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"


class TesseractStore {
    private tesseractWritable: Writable<wasm.Tesseract | null> = writable(null)

    async getTesseract(): Promise<wasm.Tesseract> {
        return get(this.tesseractWritable)!
    }

    async unlock(pin: string) {
        await init()
        this.tesseractWritable.set(new wasm.Tesseract())
        const encoder = new TextEncoder()
        const passphrase = encoder.encode(pin)

        this.tesseractWritable.subscribe((value) => {
            value!.load_from_storage()
            value!.unlock(passphrase)
            if (!value!.autosave_enabled()) {
                value!.set_autosave()
            }   
            console.log('Tesseract: ', value)
        })
    }

    lock() {
        this.tesseractWritable.subscribe((value) => {value?.lock()})
    }

}

export const TesseractStoreInstance = new TesseractStore()
