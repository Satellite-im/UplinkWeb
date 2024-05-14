import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'

class CTesseract {
    private tesseract: wasm.Tesseract

    constructor() {
        this.tesseract = new wasm.Tesseract()
      }

    getTesseract(): wasm.Tesseract {
        return this.tesseract
    }

    getAccounts() {}

    unlock(pin: string) {
        init().then((_: any) => {
            this.tesseract.load_from_storage()


            const encoder = new TextEncoder();
            const passphrase = encoder.encode(pin);

            this.tesseract.unlock(passphrase)

            if (!this.tesseract.autosave_enabled()) {
                this.tesseract.set_autosave()
            }
            console.log('Tesseract: ', this.tesseract)
        })
    }
    
    lock() {
        this.tesseract.lock()
    }
}

export const Tesseract = new CTesseract()