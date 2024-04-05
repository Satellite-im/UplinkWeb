import { Status, type Appearance, type Route, type SettingsRoute, type Shape, MessageAttachmentKind, KeybindAction } from "$lib/enums"


export type SelectOption = {
    value: string,
    text: string
}

export type Reaction = {
    count: number,
    emoji: string,
    highlight: Appearance
    description: string,
}

export type ProfilePictureRequirements = {
    image: string,
    status: Status, // TODO: Remove this
    notifications: number,
    highlight: Appearance,
}

export type ProfilePicture = {
    image: string,
}

export type ProfileData = {
    photo: ProfilePicture,
    banner: ProfilePicture,
    status: Status,
    status_message: string
}

export let defaultProfileData = {
    photo: { image: "" },
    banner: { image: "" },
    status: Status.Offline,
    status_message: "Unknown status message."
}

export type Id = {
    short: string,
}

export type MediaMeta = {
    is_playing_audio: boolean,
    is_streaming_video: boolean,
    is_muted: boolean,
    is_deafened: boolean,
    is_unknown_status: boolean
}

export type User = {
    id: Id;
    key: string,
    name: string,
    profile: ProfileData,
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
        is_playing_audio: false
    }
}

export type NavRoute = {
    name: string,
    icon: Shape,
    to: Route | SettingsRoute,
}

export type Chat = {
    name: string,
    motd: string,
    notifications: number,
    activity: boolean,
    users: User[],
    last_message_at: Date,
    last_message_preview: string,
}

export let defaultChat = {
    name: "",
    motd: "",
    notifications: 0,
    activity: false,
    users: [],
    last_message_at: new Date,
    last_message_preview: ""
}

export type Call = {
    startedAt: Date,
    chat: Chat,
    inCall: boolean
}

export type ContextItem = {
    id: string,
    icon: Shape,
    text: string,
    appearance: Appearance,
}

export type FileInfo = {
    id: number,
    type: string,
    size: number,
    name: string,
    source: string
}

export type Attachment = {
    kind: MessageAttachmentKind,
    name: string,
    size: number,
    location: string,
}

export type MessageDetails = {
    at: Date,
    origin: User,
    remote: boolean,
}

export type Message = {
    details: MessageDetails,
    inReplyTo: Message | null,
    reactions: Reaction[],
    attachments: Attachment[],
    text: string[], // Each string represents a line of content in the message. Line breaks are created by sending multiple text strings.
}

export type MessageGroup = {
    details: MessageDetails,
    messages: Message[],    
}

export type Transaction = {
    at: Date,
    to: User,
    from: User,
    amount: number,
    note: string
}

export type Keybind = {
    action: KeybindAction,
    key: string,
    modifiers: string[]
}