import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from '../../../warp-wasm/pkg/warp_ipfs'
import { WarpStore } from "./WarpStore"


class MultipassStore {
    private multipassWritable: Writable<wasm.MultiPassBox | null>
    private identityProfile: Writable<wasm.IdentityProfile | null> = writable(null)

    constructor(multipass: Writable<wasm.MultiPassBox | null>) {
        this.multipassWritable = multipass
    }

    async createIdentity(username: string, passphrase: string | undefined): Promise<void> {
        console.log('Started creating identity')
        console.log('Get multipass instance')
        this.multipassWritable.subscribe(async (value) => {
            this.identityProfile.set(await value!.create_identity(username, passphrase))
            this.identityProfile.subscribe((value) => {
                console.log('Own Identity, username: ', value!.identity().username())
            })
            console.log('Created identity')
        })
    }

    async getOwnIdentity(): Promise<wasm.Identity> {
        let multipass = get(this.multipassWritable)!
        return await multipass.get_own_identity()
    }

    async updateUsername(new_username: string) {
        this.multipassWritable.subscribe((value) => 
            {value!.update_identity(wasm.IdentityUpdate.Username, new_username)})
        await this._updateIdentity()
    }

    async updateStatusMessage(new_status_message: string) {
        this.multipassWritable.subscribe((value) => 
            {value!.update_identity(wasm.IdentityUpdate.StatusMessage, new_status_message)})
        await this._updateIdentity()
    }

    async _updateIdentity() {
        let multipass = get(this.multipassWritable)!
        this.multipassWritable.subscribe(async (value) =>  {
            let updated_identity = await multipass.get_own_identity()
            this.identityProfile.subscribe((value) => {value!.set_identity(updated_identity)})
        })
    }

}

export const MultipassStoreInstance = new MultipassStore(WarpStore.warp.multipass)
