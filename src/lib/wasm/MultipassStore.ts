import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"


class MultipassStore {
    private multipassWritable: Writable<wasm.MultiPassBox | null>
    private identityProfile: Writable<wasm.IdentityProfile | null> = writable(null)

    constructor(multipass: Writable<wasm.MultiPassBox | null>) {
        this.multipassWritable = multipass
    }

    async createIdentity(username: string, passphrase: string | undefined): Promise<wasm.IdentityProfile> {
        console.log('Started creating identity')
        console.log('Get multipass instance')

        let identityProfile = await new Promise<wasm.IdentityProfile>((resolve, reject) => {
            this.multipassWritable.subscribe(async (value) => {
                try {
                    // TODO(Lucas): get_own_identity is not working
                    // let ownIdentity = await value!.get_own_identity()
                    // console.log('Own Identity: ', ownIdentity)
                    const identity = await value!.create_identity(username, passphrase)
                    this.identityProfile.set(identity)
                    this.identityProfile.subscribe((value) => {
                        console.log('Create New Account. Username: ', value!.identity().username())
                        resolve(value!)
                    });
                } catch (error) {
                    console.error('Error creating identity: ', error)
                    reject(error)
                }
            })
        })
        console.log('Created identity');
        return identityProfile
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
