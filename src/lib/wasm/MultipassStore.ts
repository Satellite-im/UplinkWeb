import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { defaultProfileData, type User } from "$lib/types"

class MultipassStore {
    private multipassWritable: Writable<wasm.MultiPassBox | null>
    private identity: Writable<wasm.Identity | null> = writable(null)

    constructor(multipass: Writable<wasm.MultiPassBox | null>) {
        this.multipassWritable = multipass
    }

    async createIdentity(username: string, statusMessage: string, passphrase: string | undefined): Promise<void> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                await multipass.create_identity(username, passphrase)
                await this.updateStatusMessage(statusMessage)
            } catch (error) {
                console.error("Error creating identity: ", error)
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
                console.error("Error getting own identity: ", error)
                return undefined
            }
        }
        return undefined
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
            const buffer = Buffer.from(newPictureBase64, "base64")
            let pictureAsBytes = new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Picture, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    async updateBannerPicture(newPictureBase64: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            const buffer = Buffer.from(newPictureBase64, "base64")
            let pictureAsBytes = new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Banner, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    async identity_from_did(id: string): Promise<User | undefined> {
        let multipass = get(this.multipassWritable)
        if (multipass) {
            try {
                let identity = await multipass.get_identity(wasm.Identifier.DID, id)
                let profile = {
                    ...defaultProfileData,
                }
                // TODO profile and banner etc. missing from wasm?
                return {
                    id: {
                        short: identity.short_id,
                    },
                    key: identity.did_key,
                    name: identity.username,
                    profile: profile,
                    media: {
                        is_playing_audio: false,
                        is_streaming_video: false,
                        is_muted: false,
                        is_deafened: false,
                        is_unknown_status: false,
                    },
                }
            } catch (error) {
                console.log(`Coultn't fetch identity ${id}: ${error}`)
            }
        }
        return undefined
    }

    private async _updateIdentity() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                const updated_identity = await multipass.get_own_identity()
                this.identity.update(() => updated_identity)
            } catch (error) {
                console.error("Error updating identity: ", error)
            }
        }
    }
}

export const MultipassStoreInstance = new MultipassStore(WarpStore.warp.multipass)
