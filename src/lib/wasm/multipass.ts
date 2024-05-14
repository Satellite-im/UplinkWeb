import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'
import { WarpInstance } from './warp'

class CMultipass {
    private multipass: wasm.MultiPassBox

    constructor() {
        this.multipass = WarpInstance.getMultipass()
      }

    create_identity(username: string, passphrase: string) {
        this.multipass.create_identity(username, passphrase)

        console.log('Own Identity: ', this.multipass.get_own_identity())
    }
}

export const Multipass = new CMultipass()