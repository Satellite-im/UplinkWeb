import type { Appearance, Route, SettingsRoute, Shape, Status } from "$lib/enums"

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

export type Id = {
    short: string,
}

export type User = {
    id: Id;
    key: string,
    name: string,
    profile: ProfileData,
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
    text: string
}

export type FileInfo = {
    type: string,
    icon: Shape,
    size: number,
    name: string
}