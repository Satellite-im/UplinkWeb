import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import { MAX_STATUS_MESSAGE_LENGTH } from "$lib/globals/constLimits"
import { log } from "$lib/utils/Logger"
import { defaultProfileData, defaultUser, type FriendRequest, type User } from "$lib/types"
import { Store } from "$lib/state/Store"
import { MessageDirection, Route, Status } from "$lib/enums"
import { ToastMessage } from "$lib/state/ui/toast"
import { SettingsStore } from "$lib/state"
import { Sounds } from "$lib/components/utils/SoundHandler"
import { MAX_RETRY_COUNT, RETRY_DELAY } from "$lib/config"
import { goto } from "$app/navigation"

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

    initMultipassListener() {
        this.multipassWritable.subscribe(async multipass => {
            if (multipass) {
                try {
                    this.handleMultipassEvents(multipass)
                } catch (error) {
                    log.error("Error handling multipass events: " + error)
                }
            } else {
                log.error("Multipass or tesseract not found")
            }
        })
    }

    private async handleMultipassEvents(multipass: wasm.MultiPassBox) {
        try {
            let events = await multipass.multipass_subscribe()
            let listener = {
                [Symbol.asyncIterator]() {
                    return events
                },
            }
            log.info("Listening to multipass events!")
            for await (const value of listener) {
                let event = value as wasm.MultiPassEventKind
                log.info(`Handling multipass events: ${wasm.MultiPassEventKindEnum[event.kind]} with did ${event.did}`)
                switch (event.kind) {
                    case wasm.MultiPassEventKindEnum.FriendRequestSent:
                    case wasm.MultiPassEventKindEnum.OutgoingFriendRequestClosed:
                    case wasm.MultiPassEventKindEnum.OutgoingFriendRequestRejected: {
                        await this.listOutgoingFriendRequests()
                        break
                    }
                    case wasm.MultiPassEventKindEnum.FriendRequestReceived: {
                        if (get(SettingsStore.state).notifications.friends) {
                            let incoming = await this.identity_from_did(event.did)
                            let count = 0
                            while (incoming === undefined && count < MAX_RETRY_COUNT) {
                                incoming = await this.identity_from_did(event.did)
                                count++
                                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
                            }
                            if (incoming) {
                                Store.addToastNotification(
                                    new ToastMessage("New friend request.", `${incoming?.name} sent a request.`, 2, undefined, undefined, () => {
                                        goto(Route.Friends)
                                        Store.state.pageState.set("active")
                                    }),
                                    Sounds.Notification
                                )
                                Store.updateUser(incoming)
                            } else {
                                Store.addToastNotification(
                                    new ToastMessage("New friend request.", `You received a new friend request.`, 2, undefined, undefined, () => {
                                        goto(Route.Friends)
                                        Store.state.pageState.set("active")
                                    }),
                                    Sounds.Notification
                                )
                            }
                        }
                        await this.listIncomingFriendRequests()
                        break
                    }
                    case wasm.MultiPassEventKindEnum.IncomingFriendRequestClosed:
                    case wasm.MultiPassEventKindEnum.IncomingFriendRequestRejected: {
                        await this.listIncomingFriendRequests()
                        break
                    }
                    case wasm.MultiPassEventKindEnum.FriendAdded: {
                        await this.listOutgoingFriendRequests()
                        await this.listIncomingFriendRequests()
                        await this.listFriends()
                        break
                    }
                    case wasm.MultiPassEventKindEnum.FriendRemoved: {
                        await this.listFriends()
                        break
                    }
                    case wasm.MultiPassEventKindEnum.Blocked:
                    case wasm.MultiPassEventKindEnum.BlockedBy:
                    case wasm.MultiPassEventKindEnum.Unblocked:
                    case wasm.MultiPassEventKindEnum.UnblockedBy: {
                        await this.listBlockedFriends()
                        break
                    }
                    case wasm.MultiPassEventKindEnum.IdentityOnline:
                    case wasm.MultiPassEventKindEnum.IdentityOffline:
                    case wasm.MultiPassEventKindEnum.IdentityUpdate: {
                        let user = await this.identity_from_did(event.did)
                        if (user) {
                            Store.updateUser(user)
                        }
                        break
                    }
                    default: {
                        log.error(`Unhandled message event: ${wasm.MultiPassEventKindEnum[event.kind]}`)
                        break
                    }
                }
            }
        } catch (error) {
            log.error("Error handling multipass events: " + error)
        }
    }

    /**
     * Creates a new identity.
     * @param username - The username for the new identity.
     * @param statusMessage - The status message for the new identity.
     * @param passphrase - The passphrase for the new identity (optional).
     * @returns A Result containing either a passphrase assigned to the identity or a failure with a WarpError.
     */
    async createIdentity(username: string, statusMessage: string, profilePicture: string): Promise<Result<WarpError, string>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let id = await multipass.create_identity(username)
                if (statusMessage.length > 0) {
                    if (statusMessage.length > MAX_STATUS_MESSAGE_LENGTH) {
                        log.warn(`Status message len is ${statusMessage.length}. Max is ${MAX_STATUS_MESSAGE_LENGTH}. Truncating to fit.`)
                        statusMessage = statusMessage.substring(0, MAX_STATUS_MESSAGE_LENGTH)
                    }
                    await this.updateStatusMessage(statusMessage)
                }
                if (profilePicture.length > 0) {
                    await this.updateProfilePhoto(profilePicture)
                }
                const identity = get(this.identity)
                log.info(`New account created. \n
                Username: ${identity?.username()} \n 
                StatusMessage: ${identity?.status_message()} \n
                Did Key: ${identity?.did_key()} \n`)
                return success(id.passphrase()!)
            } catch (error) {
                log.error("Error creating identity: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    async fetchAllFriendsAndRequests() {
        await this.listIncomingFriendRequests()
        await this.listOutgoingFriendRequests()
        await this.listBlockedFriends()
        await this.listFriends()
    }

    /**
     * Lists outgoing friend requests.
     * @returns A list of outgoing friend requests or an empty array in case of error.
     */
    async listOutgoingFriendRequests() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let outgoingFriendRequests: Array<any> = await multipass.list_outgoing_request()
                let outgoingFriendRequestsUsers: Array<FriendRequest> = []
                for (let i = 0; i < outgoingFriendRequests.length; i++) {
                    let friendUser = await this.identity_from_did(outgoingFriendRequests[i].identity)
                    if (friendUser) {
                        let friendRequest: FriendRequest = {
                            direction: MessageDirection.Outbound,
                            to: friendUser.key,
                            from: get(Store.state.user).key,
                            at: new Date(),
                        }
                        outgoingFriendRequestsUsers.push(friendRequest)
                        Store.updateUser(friendUser)
                    }
                }
                Store.setFriendRequests(
                    get(Store.state.activeRequests).filter(r => r.direction === MessageDirection.Inbound),
                    outgoingFriendRequestsUsers
                )
            } catch (error) {
                log.error("Error listing incoming friend requests: " + error)
            }
        }
    }

    /**
     * Sends a friend request.
     * @param friend - The DID or Username#short of the user to send a friend request to.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async sendFriendRequest(friend: string): Promise<Result<WarpError, void>> {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let did = friend
                if (!friend.startsWith("did:key") && friend.includes("#")) {
                    let split_data = friend.split("#")
                    if (
                        split_data.length != 2 ||
                        split_data[0].length < 4 || // Username constraints
                        split_data[0].length > 32 ||
                        split_data[1].length != 8
                    ) {
                        return failure(handleErrors("Invalid identity"))
                    }
                    let identity: any[] = await multipass.get_identity(wasm.Identifier.Username, friend) // This is empty if it was never resolved
                    // It should only find 1 matching identity
                    if (identity.length != 1) {
                        return failure(handleErrors("Invalid identity"))
                    }
                    did = identity[0].did_key
                }
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
                log.error("Error accepting friend request: " + error)
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
                log.error("Error denying friend request: " + error)
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
                log.error("Error canceling friend request: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.MULTIPASS_NOT_FOUND)
    }

    /**
     * Lists incoming friend requests.
     * @returns A list of incoming friend requests or an empty array in case of error.
     */
    async listIncomingFriendRequests() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let incomingFriendRequests: Array<any> = await multipass.list_incoming_request()
                let incomingFriendRequestsUsers: Array<FriendRequest> = []
                for (let i = 0; i < incomingFriendRequests.length; i++) {
                    let friendUser = await this.identity_from_did(incomingFriendRequests[i].identity)
                    if (friendUser) {
                        let friendRequest: FriendRequest = {
                            direction: MessageDirection.Inbound,
                            to: get(Store.state.user).key,
                            from: friendUser.key,
                            at: new Date(),
                        }
                        incomingFriendRequestsUsers.push(friendRequest)
                        Store.updateUser(friendUser)
                    }
                }
                Store.setFriendRequests(
                    incomingFriendRequestsUsers,
                    get(Store.state.activeRequests).filter(r => r.direction === MessageDirection.Outbound)
                )
            } catch (error) {
                log.error("Error listing incoming friend requests: " + error)
            }
        }
    }

    /**
     * Lists blocked friends.
     * @returns A list of blocked friends or an empty array in case of error.
     */
    async listBlockedFriends() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let blockedUsersAny: Array<any> = await multipass.block_list()
                let blockedUsers: Array<string> = []
                for (let i = 0; i < blockedUsersAny.length; i++) {
                    let friendUser = await this.identity_from_did(blockedUsersAny[i])
                    if (friendUser) {
                        blockedUsers.push(friendUser.key)
                        Store.updateUser(friendUser)
                    }
                }
                Store.setBlockedUsers(blockedUsers)
            } catch (error) {
                log.error("Error listing blocked friends: " + error)
            }
        }
    }

    /**
     * Lists friends.
     * @returns A list of friends or an empty array in case of error.
     */
    async listFriends() {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let friendsAny: Array<any> = await multipass.list_friends()
                let friendsUsers: Array<string> = []
                for (let i = 0; i < friendsAny.length; i++) {
                    let friendUser = await this.identity_from_did(friendsAny[i])
                    if (friendUser) {
                        friendsUsers.push(friendUser.key)
                        Store.updateUser(friendUser)
                    }
                }
                Store.setFriends(friendsUsers)
            } catch (error) {
                log.error("Error listing friends: " + error)
            }
        }
    }

    /**
     * Lists users for a call.
     * Update users cache if they are not already in cache.
     * It avoids problem if there is some user in call that is not current user's friend.
     */
    async listUsersForACall(callUsers: Array<string>) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            try {
                let usersInCall: Array<string> = []
                for (let i = 0; i < callUsers.length; i++) {
                    let userInCall = await this.identity_from_did(callUsers[i])
                    if (userInCall) {
                        usersInCall.push(userInCall.key)
                        // Add users in cache
                        Store.updateUser(userInCall)
                    }
                }
            } catch (error) {
                log.error("Error getting users in a call: " + error)
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
                log.error("Error removing friend: " + error)
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
                log.error("Error blocking user: " + error)
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
                log.error("Error unblocking user: " + error)
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
                log.error("Error getting own identity: " + error)
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
     * Creates or updates a metadata key/value.
     * @param key - The key for the metadata.
     * @param value - The value for the metadata.
     */
    async setMetadata(key: string, value: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            await multipass.update_identity(wasm.IdentityUpdate.AddMetadataKey, [key, value])
            await this._updateIdentity()
        }
    }

    /**
     * Removes a metadata key.
     * @param key - The key for the metadata.
     */
    async removeMetadata(key: string) {
        const multipass = get(this.multipassWritable)

        if (multipass) {
            await multipass.update_identity(wasm.IdentityUpdate.RemoveMetadataKey, key)
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
            const buffer = Buffer.from(newPictureBase64, "base64")
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
            const buffer = Buffer.from(newPictureBase64, "base64")
            let pictureAsBytes = new Uint8Array(buffer)
            await multipass.update_identity(wasm.IdentityUpdate.Banner, pictureAsBytes)
            await this._updateIdentity()
        }
    }

    /**
     * Updates the status.
     * @param newStatus - The new status to be set.
     */
    async updateStatus(newStatus: string) {
        const multipass = get(this.multipassWritable)
        if (multipass) {
            try {
                let identityStatus: wasm.IdentityStatus
                switch (newStatus) {
                    case "online":
                        identityStatus = wasm.IdentityStatus.Online
                        break
                    case "idle":
                        identityStatus = wasm.IdentityStatus.Away
                        break
                    case "do-not-disturb":
                        identityStatus = wasm.IdentityStatus.Busy
                        break
                    case "offline":
                        identityStatus = wasm.IdentityStatus.Offline
                        break
                    default:
                        identityStatus = wasm.IdentityStatus.Offline
                        break
                }
                await multipass.set_identity_status(identityStatus)
            } catch (error) {
                log.error("Error updating status: " + error)
            }
        }
    }

    async identity_from_did(id: string, maxRetries = 3): Promise<User | undefined> {
        let multipass = get(this.multipassWritable)
        let lastErr
        if (multipass) {
            for (let tries = 0; tries < maxRetries; tries++) {
                try {
                    let identity = (await multipass.get_identity(wasm.Identifier.DID, id))[0]
                    let profilePicture = await this.getUserProfilePicture(id)
                    let bannerPicture = await this.getUserBannerPicture(id)
                    let status = await this.getUserStatus(id)
                    return {
                        ...defaultUser,
                        key: identity === undefined ? id : identity.did_key,
                        name: identity === undefined ? id : identity.username,
                        profile: {
                            ...defaultProfileData,
                            photo: {
                                image: profilePicture,
                                frame: {
                                    name: "",
                                    image: "",
                                },
                            },
                            banner: {
                                image: bannerPicture,
                                overlay: "",
                            },
                            status: status,
                            status_message: identity === undefined ? "" : identity.status_message ?? "",
                        },
                        integrations: identity === undefined ? new Map<string, string>() : identity.metadata,
                        media: {
                            is_playing_audio: false,
                            is_streaming_video: false,
                            is_muted: false,
                            is_deafened: false,
                            is_unknown_status: false,
                        },
                    }
                } catch (error) {
                    lastErr = error
                    await new Promise(resolve => setTimeout(resolve, 3000))
                }
            }
        }
        if (lastErr) {
            log.error(`Couldn't fetch identity ${id}: ${lastErr}`)
        }
        return undefined
    }

    private async getUserStatus(did: string): Promise<Status> {
        let multipass = get(this.multipassWritable)
        let status = Status.Offline
        if (multipass) {
            try {
                let identityStatus = await multipass.identity_status(did)
                const identityStatusMap: { [key in wasm.IdentityStatus]: Status } = {
                    [wasm.IdentityStatus.Online]: Status.Online,
                    [wasm.IdentityStatus.Away]: Status.Idle,
                    [wasm.IdentityStatus.Busy]: Status.DoNotDisturb,
                    [wasm.IdentityStatus.Offline]: Status.Offline,
                }
                status = identityStatusMap[identityStatus] ?? Status.Offline
            } catch (error) {
                log.error(`Couldn't fetch status for ${did}: ${error}`)
            }
        }
        return status
    }

    private async getUserProfilePicture(did: string): Promise<string> {
        let multipass = get(this.multipassWritable)
        let profilePicture = ""
        if (multipass) {
            try {
                let identityProfilePicture = await multipass.identity_picture(did)
                profilePicture = identityProfilePicture && identityProfilePicture.data ? (identityProfilePicture.data().length > 2 ? this.to_base64(identityProfilePicture.data()) : "") : ""
            } catch (error) {
                // log.error(`Couldn't fetch profile picture for ${did}: ${error}`)
            }
        }
        return profilePicture
    }

    private async getUserBannerPicture(did: string): Promise<string> {
        let multipass = get(this.multipassWritable)
        let bannerPicture = ""
        if (multipass) {
            try {
                let identityBannerPicture = await multipass.identity_banner(did)
                bannerPicture = identityBannerPicture && identityBannerPicture.data ? (identityBannerPicture.data().length > 2 ? this.to_base64(identityBannerPicture.data()) : "") : ""
            } catch (error) {
                // log.error(`Couldn't fetch banner picture for ${did}: ${error}`)
            }
        }
        return bannerPicture
    }

    private to_base64(data: Uint8Array) {
        const binaryString = Array.from(data)
            .map(byte => String.fromCharCode(byte))
            .join("")
        const base64String = btoa(binaryString)
        const cleanedBase64String = base64String.replace("dataimage/jpegbase64", "")
        return `data:image/jpeg;base64,${cleanedBase64String}`
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
                let profilePicture = await this.getUserProfilePicture(updated_identity.did_key())
                let bannerPicture = await this.getUserBannerPicture(updated_identity.did_key())
                this.identity.update(() => updated_identity)
                Store.setUserFromIdentity(updated_identity, profilePicture, bannerPicture)
                log.info(`Identity updated\n 
                  Username: ${updated_identity.username()} \n
                  StatusMessage: ${updated_identity.status_message()} \n`)
            } catch (error) {
                log.error("Error updating identity: " + error)
            }
        }
    }
}

export const MultipassStoreInstance = new MultipassStore(WarpStore.warp.multipass)
