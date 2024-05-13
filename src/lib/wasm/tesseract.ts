// import init, * as wasm from '../../../../warp-wasm/pkg/warp_ipfs'

class CTesseract {
    getAccounts() {}

    unlock(pin: string) {
        // init().then((_: any) => {
        //     let tesseract = new wasm.Tesseract()
        //     tesseract.load_from_storage()

        //     const encoder = new TextEncoder();
        //     const passphrase = encoder.encode(pin);
            
        //     tesseract.unlock(passphrase)

        //     if (!tesseract.autosave_enabled()) {
        //       tesseract.set_autosave()
        //     }
        // })
    }
    
    lock() {}
}

export const Tesseract = new CTesseract()