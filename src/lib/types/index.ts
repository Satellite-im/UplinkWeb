import { Status, type Appearance, type Route, type SettingsRoute, type Shape, MessageAttachmentKind } from "$lib/enums"

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
    status: Status,
    status_message: string
}

export let defaultProfileData = {
    photo: { image: "" },
    status: Status.Offline,
    status_message: ""
}

export type Id = {
    short: string,
}

export type User = {
    id: Id;
    key: string,
    name: string,
    profile: ProfileData,
}

export let defaultUser: User = {
    id: { short: "xxxxxx" },
    key: "0x0",
    name: "",
    profile: defaultProfileData,
}

export type NavRoute = {
    name: string,
    icon: Shape,
    to: Route | SettingsRoute,
}

export type Chat = {
    name: string,
    notifications: number,
    activity: boolean,
    users: User[],
    last_message_at: Date,
    last_message_preview: string,
}

export type ContextItem = {
    id: string,
    icon: Shape,
    text: string,
    appearance: Appearance,
}

export type FileInfo = {
    type: string,
    icon: Shape,
    size: number,
    name: string
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