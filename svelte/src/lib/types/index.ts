import type { Appearance, Status } from "$lib/enums"

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
    status: Status,
    notifications: number,
    highlight: Appearance,
}