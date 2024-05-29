
export enum WarpError {
    SELF_REQUEST = 'You cannot send yourself a friend request',
    SEND_REQUEST_ALREADY_SENT = 'Send request already sent',
    GENERAL_ERROR = 'An unknown error occurred',
    MULTIPASS_NOT_FOUND = 'Multipass instance not found',
}

export function handleErrors(error: any): WarpError{
    if (error instanceof Error) {
        if (error.message.includes('You cannot send yourself a friend request')) {
            return WarpError.SELF_REQUEST
        }
        if (error.message.includes('Send request already sent')) {
            return WarpError.SEND_REQUEST_ALREADY_SENT
        }
    }
    return WarpError.GENERAL_ERROR
}