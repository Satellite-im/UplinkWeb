import { Store } from "$lib/state/store";
import { get } from "svelte/store";

export enum WarpError {
    SELF_REQUEST = 'You cannot send yourself a friend request',
    FRIEND_REQUEST_ALREADY_EXIST = 'Friend request already exist',
    IDENTITY_NOT_CREATED = 'Identity has not been created',
    DIRECTORY_ALREADY_EXIST = 'Directory already exist',
    USER_HAS_BLOCKED_YOU = 'User has blocked you from being able to interact with them',
    USER_ALREADY_EXIST_AS_FRIEND = 'User already exist as a friend',
    GENERAL_ERROR = 'An unknown error occurred',
    MULTIPASS_NOT_FOUND = 'Multipass instance not found',
    CONSTELLATION_NOT_FOUND = 'Constellation instance not found'
}

export function handleErrors(error: any): WarpError{
    get(Store.state.logger).error('Error: ' + error)
    if (error instanceof Error) {
        const message = error.message
        switch (true) {
            case message.includes(WarpError.SELF_REQUEST):
                return WarpError.SELF_REQUEST
            case message.includes(WarpError.FRIEND_REQUEST_ALREADY_EXIST):
                return WarpError.FRIEND_REQUEST_ALREADY_EXIST
            case message.includes(WarpError.IDENTITY_NOT_CREATED):
                return WarpError.IDENTITY_NOT_CREATED;
            case message.includes(WarpError.DIRECTORY_ALREADY_EXIST):
                return WarpError.DIRECTORY_ALREADY_EXIST;
            case message.includes(WarpError.USER_HAS_BLOCKED_YOU):
                return WarpError.USER_HAS_BLOCKED_YOU
            case message.includes(WarpError.USER_ALREADY_EXIST_AS_FRIEND):
                return WarpError.USER_ALREADY_EXIST_AS_FRIEND
            default:
                return WarpError.GENERAL_ERROR
        }
    }
    return WarpError.GENERAL_ERROR
}