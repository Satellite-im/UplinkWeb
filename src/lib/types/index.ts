import { Status, type Appearance, type Route, type SettingsRoute, type Shape, MessageAttachmentKind, KeybindAction, MessageDirection, ChatType, CommunityChannelKind, KeybindState } from "$lib/enums"
import type { Cancellable } from "$lib/utils/CancellablePromise"
import type { Writable } from "svelte/store"

export enum OperationState {
    Initial = "Initial",
    Loading = "Loading",
    Success = "Success",
    Error = "Error",
}

export type Frame = {
    image: string
    author?: string
    name: string
}

export type ProfileOverlay = {
    image: string
    name: string
}

export type Bundle = {
    name: string
    frames: Frame[]
    profileOverlays: ProfileOverlay[]
    // themes: []
    // fonts: []
}

export type SelectOption = {
    value: string
    text: string
}

export type Reaction = {
    reactors: Set<string>
    emoji: string
    highlight: Appearance
    description: string
}

export type ProfilePictureRequirements = {
    image: string
    status: Status // TODO: Remove this
    notifications: number
    highlight: Appearance
    frame: Frame
}

export type SimpleRoute = {
    name: string
    icon: Shape
}


export let defaultProfileData = {
    photo: { image: "", frame: { name: "", image: "" } },
    banner: { image: "", overlay: "" },
    status: Status.Offline,
    status_message: "Unknown status message.",
}

export type Id = {
    short: string
}


export type ProfilePicture = {
    image: string
    frame: Frame
}

export type BannerPicture = {
    image: string
    overlay: string
}

export type ProfileData = {
    photo: ProfilePicture
    banner: BannerPicture
    status: Status
    status_message: string
}

export type MediaMeta = {
    is_playing_audio: boolean
    is_streaming_video: boolean
    is_muted: boolean
    is_deafened: boolean
    is_unknown_status: boolean
}

export type User = {
    id: Id
    key: string
    name: string
    profile: ProfileData
    media: MediaMeta
}

export let defaultUser: User = {
    id: { short: "xxxxxx" },
    key: "0x0",
    name: "Unknown User",
    profile: defaultProfileData,
    media: {
        is_deafened: false,
        is_muted: false,
        is_unknown_status: true,
        is_streaming_video: false,
        is_playing_audio: false,
    },
}

export type ChatSettings = {
    displayOwnerBadge: boolean
    readReciepts: boolean
    permissions: {
        allowAnyoneToAddUsers: boolean
        allowAnyoneToModifyPhoto: boolean
        allowAnyoneToModifyName: boolean
    }
}

export type NavRoute = {
    name: string
    icon: Shape
    to: Route | SettingsRoute
}

export type Chat = {
    id: string
    name: string
    motd: string
    kind: ChatType
    settings: ChatSettings
    creator?: string
    notifications: number
    activity: boolean
    users: string[]
    typing_indicator: { [key: string]: Date }
    last_message_at: Date
    last_message_preview: string
}

export type CommunityChannel = {
    icon: Shape
    name: string
    kind: CommunityChannelKind
}

export type CommunityChannelGroup = {
    name: string
    channels: CommunityChannel[]
}

export function hashChat(chat: Chat): string {
    const dataString =
        chat.name +
        chat.users
            .map(user => user)
            .sort()
            .join("")

    let hash = 0,
        i,
        chr
    if (dataString.length === 0) return hash.toString()
    for (i = 0; i < dataString.length; i++) {
        chr = dataString.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0
    }
    return hash.toString()
}

export let defaultChat: Chat = {
    id: "",
    name: "",
    motd: "",
    notifications: 0,
    kind: ChatType.DirectMessage,
    creator: undefined,
    settings: {
        displayOwnerBadge: true,
        readReciepts: true,
        permissions: {
            allowAnyoneToAddUsers: false,
            allowAnyoneToModifyPhoto: false,
            allowAnyoneToModifyName: false,
        },
    },
    activity: false,
    users: [],
    typing_indicator: {},
    last_message_at: new Date(),
    last_message_preview: "",
}

export type Call = {
    startedAt: Date
    chat: Chat
    inCall: boolean
}

export type ContextItem = {
    id: string
    icon: Shape
    text: string
    disabled?: boolean
    appearance: Appearance
    onClick: () => void
}

export type FileInfo = {
    icon: Shape
    id: string
    type: string
    size: number
    name: string
    remotePath: string
    source: string
    isRenaming: OperationState
    extension?: string
    items?: FileInfo[]
    parentId?: string
}

export type Attachment = {
    kind: MessageAttachmentKind
    name: string
    size: number
    location: string
}

export type FriendRequest = {
    at: Date
    direction: MessageDirection
    to: string
    from: string
}

export type MessageDetails = {
    at: Date
    origin: string
    remote: boolean
}

export type Message = {
    id: string
    details: MessageDetails
    inReplyTo: Message | null
    reactions: { [key: string]: Reaction }
    attachments: Attachment[]
    text: string[]
    pinned: boolean
}

export function mentions_user(message: Message, user: string): boolean {
    // TODO
    return false
}

export type PendingMessage = {
    message: {
        id: string
        at: Date
        text: string[]
    }
    attachmentProgress: Writable<{ [file: string]: FileProgress }>
}

export type FileProgress = {
    // The name of the file
    name: string
    // The current progressed size of the file
    size: number
    // The total size of the file
    total?: number
    // Call this to abort the progress
    cancellation?: Cancellable
    // If true the progress has been finished
    done?: boolean
    // Returns the error that occurred during filetransfer if present
    error?: string
}

export type MessageGroup = {
    details: MessageDetails
    messages: Message[]
}

export type Transaction = {
    at: Date
    to: string
    from: string
    amount: number
    note: string
}

export type Keybind = {
    action: KeybindAction
    key: string
    modifiers: string[]
    state: KeybindState
}

export type GiphyImage = {
    url: string
}

export type GiphyGif = {
    id: string
    uniqueKey: string
    images: {
        fixed_height_small: GiphyImage
    }
    title: string
    loaded?: boolean
}

export type Sticker = {
    name: string
    path: string
}

export type StickerCollection = {
    name: string
    author: string
    assets: Sticker[]
}

export type StickerManifest = StickerCollection[]
