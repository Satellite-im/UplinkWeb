import type { Call, Chat, FileInfo, FriendRequest, User } from "$lib/types"
import type { Logger } from "$lib/utils/Logger"
import type { Writable } from "svelte/store"
import type { ToastMessage } from "./ui/toast"

export interface IState {
    user: Writable<User>
    blocked: Writable<User[]>
    activeRequests: Writable<FriendRequest[]>
    friends: Writable<User[]>
    favorites: Writable<Chat[]>
    files: Writable<FileInfo[]>
    openFolders: Writable<Record<string, boolean>>
    devices: {
        muted: Writable<boolean>
        deafened: Writable<boolean>
        input: Writable<string>
        output: Writable<string>
    }
    activeChat: Writable<Chat>
    activeCall: Writable<Call | null>
    toasts: Writable<{ [key: string]: [ToastMessage, NodeJS.Timeout] }>
    logger: Writable<Logger>
}
