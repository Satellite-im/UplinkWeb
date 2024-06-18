import { Status, type Appearance, type Route, type SettingsRoute, type Shape, MessageAttachmentKind, KeybindAction, MessageDirection, ChatType, CommunityChannelKind, KeybindState } from "$lib/enums"

export enum OperationState {
    Initial = "Initial",
    Loading = "Loading",
    Success = "Success",
    Error = "Error",
}

export type Frame = {
    image: string
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
    count: number
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

export let defaultProfileData = {
    photo: { image: "", frame: { name: "", image: "" } },
    banner: { image: "", overlay: "" },
    status: Status.Offline,
    status_message: "Unknown status message.",
}

export type Id = {
    short: string
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
    creator: User
    notifications: number
    activity: boolean
    users: User[]
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
            .map(user => user.name)
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

export let defaultChat = {
    id: "",
    name: "",
    motd: "",
    notifications: 0,
    kind: ChatType.DirectMessage,
    creator: defaultUser,
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
    appearance: Appearance
    onClick: () => void
}

export type FileInfo = {
    icon: Shape
    id: string
    type: string
    size: number
    name: string
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
    to: User
    from: User
}

export type MessageDetails = {
    at: Date
    origin: User
    remote: boolean
}

export type Message = {
    id: string
    details: MessageDetails
    inReplyTo: Message | null
    reactions: Reaction[]
    attachments: Attachment[]
    text: string[]
}

export type MessageGroup = {
    details: MessageDetails
    messages: Message[]
}

export type Transaction = {
    at: Date
    to: User
    from: User
    amount: number
    note: string
}

export type Keybind = {
    action: KeybindAction
    key: string
    modifiers: string[],
    state: KeybindState
}
