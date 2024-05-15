import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'
import { WarpInstance } from './warp'

class CMultipass {
    private multipass!: wasm.MultiPassBox

    async create_identity(username: string, passphrase: string | undefined): Promise<void> {
        await init();
        console.log('Started creating identity')
        this.multipass = WarpInstance.get_multipass()
        console.log('Get multipass instance')
        let identity_profile = await this.multipass.create_identity(undefined, undefined)
        console.log('Created identity')
        let own_identity = await this.multipass.get_own_identity()
        console.log('Own Identity, username: ', own_identity.username)
    }

    async get_own_identity(): Promise<wasm.Identity> {
        await init()
        this.multipass = WarpInstance.get_multipass()
        return await this.multipass.get_own_identity()
    }
}

export const Multipass = new CMultipass();
