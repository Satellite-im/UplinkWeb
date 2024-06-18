import { get, writable, type Writable } from "svelte/store";
import * as wasm from "warp-wasm";
import { WarpStore } from "./WarpStore";
import { WarpError, handleErrors } from "./HandleWarpErrors";
import { failure, success, type Result } from "$lib/utils/Result";
import { Store } from "$lib/state/store";

/**
 * A class that provides various methods to interact with a MultiPassBox.
 */
class MultipassStore {
    private multipassWritable: Writable<wasm.MultiPassBox | null>
    private identity: Writable<wasm.Identity | null> = writable(null)

    /**
     * Creates an instance of MultipassStore.
     * @param multipass - A writable store containing a MultiPassBox or null.
     */
    constructor(multipass: Writable<wasm.MultiPassBox | null>) {
        this.multipassWritable = multipass
    }

    /**
     * Creates a new identity.
     * @param username - The username for the new identity.
     * @param statusMessage - The status message for the new identity.
     * @param passphrase - The passphrase for the new identity (optional).
     */
    async createIdentity(username: string, statusMessage: string, passphrase: string | undefined): Promise<void> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                await multipass.create_identity(username, passphrase)
                await this.updateStatusMessage(statusMessage)
                const identity = get(this.identity)
                get(Store.state.logger).info(`New account created. \n
                Username: ${identity?.username()} \n 
                StatusMessage: ${identity?.status_message()} \n
                Did Key: ${identity?.did_key()} \n`)
            } catch (error) {
                get(Store.state.logger).error('Error creating identity: ' + error)
            }
        }
    }

    /**
     * Sends a friend request.
     * @param did - The DID of the user to send a friend request to.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async sendFriendRequest(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                get(Store.state.logger).debug('Sending friend request to: ' + did)
                return success(await multipass.send_request(did))
            } catch (error) {
                return failure(handleErrors(error))
            }
        } else {
            return failure(WarpError.MULTIPASS_NOT_FOUND)
        }
    }

    /**
     * Accepts a friend request.
     * @param did - The DID of the user whose friend request is to be accepted.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async acceptFriendRequest(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                return success(await multipass.accept_request(did))
            } catch (error) {
                get(Store.state.logger).error('Error accepting friend request: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Denies a friend request.
     * @param did - The DID of the user whose friend request is to be denied.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async denyFriendRequest(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                return success(await multipass.deny_request(did))
            } catch (error) {
                get(Store.state.logger).error('Error denying friend request: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Cancels a friend request.
     * @param did - The DID of the user whose friend request is to be canceled.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async cancelFriendRequest(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                return success(await multipass.close_request(did))
            } catch (error) {
                get(Store.state.logger).error('Error cancelling friend request: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Lists incoming friend requests.
     * @returns A list of incoming friend requests or an empty array in case of error.
     */
    async listIncomingFriendRequests(): Promise<any> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let friends = await multipass.list_incoming_request()
                return friends
            } catch (error) {
                get(Store.state.logger).error('Error listing incoming friend requests: ' + error)
                return []
            }
        }
    }

    /**
     * Lists outgoing friend requests.
     * @returns A list of outgoing friend requests or an empty array in case of error.
     */
    async listOutgoingFriendRequests(): Promise<any> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let friends = await multipass.list_outgoing_request()
                return friends
            } catch (error) {
                get(Store.state.logger).error('Error listing outgoing friend requests: ' + error)
                return []
            }
        }
    }

    /**
     * Lists blocked friends.
     * @returns A list of blocked friends or an empty array in case of error.
     */
    async listBlockedFriends(): Promise<any> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let blockedFriends = await multipass.block_list()
                return blockedFriends
            } catch (error) {
                get(Store.state.logger).error('Error listing blocked friends: ' + error)
                return []
            }
        }
    }

    /**
     * Lists friends.
     * @returns A list of friends or an empty array in case of error.
     */
    async listFriends(): Promise<any> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let friends = await multipass.list_friends()
                return friends
            } catch (error) {
                get(Store.state.logger).error('Error listing friends: ' + error)
                return []
            }
        }
    }

    /**
     * Removes a friend.
     * @param did - The DID of the friend to be removed.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async removeFriend(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                return success(await multipass.remove_friend(did))
            } catch (error) {
                get(Store.state.logger).error('Error removing friend: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Blocks a user.
     * @param did - The DID of the user to be blocked.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async blockUser(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                return success(await multipass.block(did))
            } catch (error) {
                get(Store.state.logger).error('Error blocking user: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Unblocks a user.
     * @param did - The DID of the user to be unblocked.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async unblockUser(did: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                return success(await multipass.unblock(did))
            } catch (error) {
                get(Store.state.logger).error('Error unblocking user: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Retrieves the own identity of the user.
     * @returns A Result containing either the own identity or a WarpError.
     */
    async getOwnIdentity(): Promise<Result<WarpError, wasm.Identity>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                const identity = await multipass.identity()
                return success(identity)
            } catch (error) {
                get(Store.state.logger).error('Error getting own identity: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Updates the username.
     * @param new_username - The new username to be set.
     */
    async updateUsername(new_username: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            await multipass.update_identity(wasm.IdentityUpdate.Username, new_username)
            await this._updateIdentity()
        }
    }

    /**
     * Updates the status message.
     * @param newStatusMessage - The new status message to be set.
     */
    async updateStatusMessage(newStatusMessage: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            await multipass.update_identity(wasm.IdentityUpdate.StatusMessage, newStatusMessage)
            await this._updateIdentity()
        }
    }

    /**
     * Updates the profile photo.
     * @param newPictureBase64 - The new profile photo in base64 format.
     */
    async updateProfilePhoto(newPictureBase64: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            const buffer = Buffer.from(newPictureBase64, 'base64')
            let pictureAsBytes = new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Picture, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    /**
     * Updates the banner picture.
     * @param newPictureBase64 - The new banner picture in base64 format.
     */
    async updateBannerPicture(newPictureBase64: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            const buffer = Buffer.from(newPictureBase64, 'base64')
            let pictureAsBytes = new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Banner, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    /**
     * Updates the identity state.
     * @private
     */
    private async _updateIdentity() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                const updated_identity = await multipass.identity()
                this.identity.update(() => updated_identity)
                get(Store.state.logger).info(`Identity updated\n 
                  Username: ${updated_identity.username()} \n
                  StatusMessage: ${updated_identity.status_message()} \n`)
            } catch (error) {
                get(Store.state.logger).error('Error updating identity: ' + error)
            }
        }
    }
}

export const MultipassStoreInstance = new MultipassStore(WarpStore.warp.multipass)
