import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"


class MultipassStore {
    private multipassWritable: Writable<wasm.MultiPassBox | null>
    private identity: Writable<wasm.Identity | null> = writable(null)

    constructor(multipass: Writable<wasm.MultiPassBox | null>) {
        this.multipassWritable = multipass
    }

    async createIdentity(username: string, statusMessage: string, passphrase: string | undefined): Promise<void> {
        console.log('Started creating identity')
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                await multipass.create_identity(username, passphrase)
                await this.updateStatusMessage(statusMessage)
                const identity = get(this.identity)
                console.log('New account created. Username: ', identity?.username())
            } catch (error) {
                console.error('Error creating identity: ', error)
            }
        }
    }

    async getOwnIdentity(): Promise<wasm.Identity | undefined> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                const identity = await multipass.get_own_identity()
                return identity
            } catch (error) {
                console.error('Error getting own identity: ', error)
                return undefined
            }
        }
        return undefined;
    }

    async updateUsername(new_username: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            await multipass.update_identity(wasm.IdentityUpdate.Username, new_username)
            await this._updateIdentity()
        }
    }

    async updateStatusMessage(newStatusMessage: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            await multipass.update_identity(wasm.IdentityUpdate.StatusMessage, newStatusMessage)
            await this._updateIdentity()
        }
    }

    async updateProfilePhoto(newPictureBase64: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            const buffer = Buffer.from(newPictureBase64, 'base64')
            let pictureAsBytes =  new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Picture, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    async updateBannerPicture(newPictureBase64: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            const buffer = Buffer.from(newPictureBase64, 'base64')
            let pictureAsBytes =  new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Banner, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    private async _updateIdentity() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                const updated_identity = await multipass.get_own_identity()
                this.identity.update(() => updated_identity)
            } catch (error) {
                console.error('Error updating identity: ', error)
            }
        }
    }
}

export const MultipassStoreInstance = new MultipassStore(WarpStore.warp.multipass);
