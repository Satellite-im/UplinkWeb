import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"

class TesseractStore {
    private tesseractWritable: Writable<wasm.Tesseract | null> = writable(null)

    async getTesseract(): Promise<wasm.Tesseract> {
        return get(this.tesseractWritable)!
    }

    async unlock(pin: string) {
        await init()
        console.log('Pin to unlock Tesseract: ', pin)
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
            
            console.log('Tesseract: ', tesseractInstance)
        } catch (error) {
            console.error('Error unlocking Tesseract: ', error)
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
