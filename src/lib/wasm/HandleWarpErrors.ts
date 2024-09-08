import { log } from "$lib/utils/Logger"

export enum WarpError {
    SELF_REQUEST = "You cannot send yourself a friend request",
    FRIEND_REQUEST_ALREADY_EXIST = "Friend request already exists",
    IDENTITY_NOT_CREATED = "Identity has not been created",
    DIRECTORY_ALREADY_EXIST = "Directory already exist",
    USER_HAS_BLOCKED_YOU = "User has blocked you from being able to interact with them",
    USER_ALREADY_EXIST_AS_FRIEND = "User already exist as a friend",
    FILE_ALREADY_EXIST = "File already exists",
    ITEM_ALREADY_EXIST_WITH_SAME_NAME = "Item with name already exists in current directory",
    ITEM_DOES_NOT_EXIST = "Item cannot be found or is invalid",
    GENERAL_ERROR = "An unknown error occurred",
    MULTIPASS_NOT_FOUND = "Multipass instance not found",
    CONSTELLATION_NOT_FOUND = "Constellation instance not found",
    RAYGUN_NOT_FOUND = "Raygun instance not found",
    FILE_SIZE_EXCEEDED = "File size exceeded",
}

export function handleErrors(error: any): WarpError {
    log.error("Error: " + error)
    if (error instanceof Error) {
        const message = error.message
        switch (true) {
            case message.includes(WarpError.SELF_REQUEST):
                return WarpError.SELF_REQUEST
            case message.includes(WarpError.FRIEND_REQUEST_ALREADY_EXIST):
                return WarpError.FRIEND_REQUEST_ALREADY_EXIST
            case message.includes(WarpError.IDENTITY_NOT_CREATED):
                return WarpError.IDENTITY_NOT_CREATED
            case message.includes(WarpError.DIRECTORY_ALREADY_EXIST):
                return WarpError.DIRECTORY_ALREADY_EXIST
            case message.includes(WarpError.USER_HAS_BLOCKED_YOU):
                return WarpError.USER_HAS_BLOCKED_YOU
            case message.includes(WarpError.USER_ALREADY_EXIST_AS_FRIEND):
                return WarpError.USER_ALREADY_EXIST_AS_FRIEND
            case message.includes(WarpError.FILE_ALREADY_EXIST):
                return WarpError.FILE_ALREADY_EXIST
            case message.includes(WarpError.ITEM_ALREADY_EXIST_WITH_SAME_NAME):
                return WarpError.ITEM_ALREADY_EXIST_WITH_SAME_NAME
            case message.includes(WarpError.ITEM_DOES_NOT_EXIST):
                return WarpError.ITEM_DOES_NOT_EXIST
            default:
                return WarpError.GENERAL_ERROR
        }
    }
    return WarpError.GENERAL_ERROR
}
