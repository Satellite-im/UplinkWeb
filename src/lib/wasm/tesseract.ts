import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'

class CTesseract {
    private tesseract: wasm.Tesseract | undefined

    getTesseract(): wasm.Tesseract {
        if (!this.tesseract) {
            throw new Error("Tesseract instance is not initialized");
        }
        return this.tesseract
    }

    getAccounts() {
        // Your implementation here
    }

    async unlock(pin: string): Promise<wasm.Tesseract> {
        await init()
        this.tesseract = new wasm.Tesseract()
        // TODO(Lucas): It seems give some problem on web
        // this.tesseract.load_from_storage()

        const encoder = new TextEncoder()
        const passphrase = encoder.encode(pin)

        this.tesseract.unlock(passphrase)

        if (!this.tesseract.autosave_enabled()) {
            this.tesseract.set_autosave()
        }
        console.log('Tesseract: ', this.tesseract)

        return this.tesseract
    }

    lock() {
        this.tesseract?.lock()
    }
}

export const Tesseract = new CTesseract()
