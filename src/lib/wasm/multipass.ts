import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'

class CMultipass {
    private ipfs: wasm.WarpIpfs | undefined

    constructor() {
        this.ipfs = undefined
      }

    createIdentity() {
        this.ipfs
    }

    init(tesseract: wasm.Tesseract) {
        init().then(async (_exports) => {
             this.ipfs = await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract)

             console.log('Ipfs: ', this.ipfs)
        })
    }
}

export const Multipass = new CMultipass()