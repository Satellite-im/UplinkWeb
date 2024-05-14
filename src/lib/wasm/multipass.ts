import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'

class CMultipass {
    private multipass: wasm.MultiPassBox | undefined

    constructor() {
        this.multipass = undefined
      }

    createIdentity() {
    }

    init(tesseract: wasm.Tesseract) {
        init().then(async (_exports) => {
             let ipfs = await new wasm.WarpIpfs(wasm.Config.minimal_testing(), tesseract)

             let multipass = ipfs

             console.log('Ipfs: ', ipfs)
        })
    }
}

export const Multipass = new CMultipass()