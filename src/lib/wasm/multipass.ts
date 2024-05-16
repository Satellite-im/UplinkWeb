import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'
import { WarpInstance } from './warp'

class CMultipass {
    private multipass!: wasm.MultiPassBox
    private identity_profile!: wasm.IdentityProfile

    async createIdentity(username: string, passphrase: string | undefined): Promise<void> {
        await init();
        console.log('Started creating identity')
        this.multipass = WarpInstance.getMultipass()
        console.log('Get multipass instance')
        this.identity_profile = await this.multipass.create_identity(username, undefined)
        console.log('Created identity')
        console.log('Own Identity, username: ', this.identity_profile.identity)
    }

    async getOwnIdentity(): Promise<wasm.Identity> {
        await init()
        return await this.multipass.get_own_identity()
    }

    async updateUsername(new_username: string) {
        await this.multipass.update_identity(wasm.IdentityUpdate.Username, new_username)
        await this._updateIdentity()
    }

    async updateStatusMessage(new_status_message: string) {
        await this.multipass.update_identity(wasm.IdentityUpdate.StatusMessage, new_status_message)
        await this._updateIdentity()
    }

    async _updateIdentity() {
        let updated_identity = await this.multipass.get_own_identity()
        this.identity_profile.set_identity(updated_identity)
    }
}

export const Multipass = new CMultipass();
