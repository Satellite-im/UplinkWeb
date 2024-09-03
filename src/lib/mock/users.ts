import { ChatType, Integrations, Status } from "$lib/enums"
import { defaultUser, type Chat, type User, hashChat, defaultChat, TypingIndicator } from "$lib/types"

export const mock_users: Array<User> = [
    {
        ...defaultUser,
        name: "Lunar Lucas",
        key: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "xe89fsia",
        },
        profile: {
            ...defaultUser.profile,
            photo: {
                image: "",
                frame: { name: "", image: "" },
            },
            banner: {
                image: "",
                overlay: "",
            },
            status: Status.Online,
            status_message: "There is no cheese on this moon.",
        },
        media: {
            ...defaultUser.media,
            is_playing_audio: true,
        },
    },
    {
        ...defaultUser,
        name: "Space Kev",
        key: "did:key:z4MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "uw7r8sa9",
        },
        profile: {
            ...defaultUser.profile,
            photo: {
                image: "",
                frame: { name: "Moon", image: "/frames/moon.png" },
            },
            banner: {
                image: "",
                overlay: "",
            },
            status: Status.Online,
            status_message: "Space Kev is doing Space Kev things!",
        },
        media: {
            ...defaultUser.media,
            is_streaming_video: true,
            is_muted: true,
            is_deafened: true,
        },
        integrations: new Map<string, string>([
            [Integrations.Twitch, "https://twitch.tv/SpaceKev"],
            [Integrations.Steam, "https://steamcommunity.com/id/SpaceKev/"],
            [Integrations.YouTube, "https://youtube.com/c/SpaceKev/"],
            [Integrations.Spotify, "@SpaceKev"],
            [Integrations.Generic, "https://satellite.im"],
            [Integrations.BTC, "1cwI2h8ETSROxAihiRDB5QqfDc3EDxWsf0"],
            [Integrations.ETH, "0x0000000000000000000000000000000000000000"],
            [Integrations.SOL, "26AKqj1Au1jGrHFm7RXVJJeu7nsbqqin5Ff3vjPxM4QK"],
        ]),
    },
    {
        ...defaultUser,
        name: "Sara Saturn",
        key: "did:key:z8HkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "tu728sce",
        },
        profile: {
            ...defaultUser.profile,
            photo: {
                image: "",
                frame: { name: "", image: "" },
            },
            banner: {
                image: "",
                overlay: "",
            },
            status: Status.Online,
            status_message: "Testing all of the things, all of the time.",
        },
    },
    {
        ...defaultUser,
        name: "Pluto Phill",
        key: "did:key:z9EkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "6efyaui8",
        },
        profile: {
            ...defaultUser.profile,
            photo: {
                image: "",
                frame: { name: "", image: "" },
            },
            status: Status.Offline,
            status_message: "I am also testing a bunch of things a bunch of the time!",
        },
        media: {
            ...defaultUser.media,
            is_deafened: true,
        },
    },
    {
        ...defaultUser,
        name: "Daring DariusDariusDariusDariusDariusDariusDariusDarius",
        key: "did:key:z7YkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "fya72e8z",
        },
        profile: {
            ...defaultUser.profile,
            photo: {
                image: "",
                frame: { name: "", image: "" },
            },
            banner: {
                image: "",
                overlay: "",
            },
            status: Status.DoNotDisturb,
            status_message: "This is a status message that you are reading.",
        },
    },
]

export const blocked_users: Array<User> = [
    {
        ...defaultUser,
        name: "Mean Person",
        key: "did:key:7xMuiaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "cixsu1o2",
        },
        profile: {
            ...defaultUser.profile,
            photo: {
                image: "",
                frame: { name: "", image: "" },
            },
            status: Status.DoNotDisturb,
            status_message: "Something hostile and aggressive.",
        },
    },
]

export const fake_user_array: Array<User> = [
    {
        ...defaultUser,
        name: "Fake User",
        key: "did:key:3xwkfegBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "xxxxxx",
        },
        profile: {
            photo: {
                image: "",
                frame: { name: "", image: "" },
            },
            banner: {
                image: "",
                overlay: "",
            },
            status: Status.Offline,
            status_message: "This user is not real.",
        },
    },
]

let mock_chats: Chat[] = [
    {
        ...defaultChat,
        id: "p41",
        name: "RC Group Chat",
        motd: "A place for people who love RC",
        kind: ChatType.Group,
        notifications: 0,
        users: [mock_users[0].key, mock_users[1].key, mock_users[3].key],
        last_message_at: new Date(),
        last_message_preview: "Wow! I had no idea that you could fly that well, good work!",
    },
    {
        ...defaultChat,
        id: "op23",
        name: "",
        motd: "",
        notifications: 4,
        users: [defaultUser.key, mock_users[0].key],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        ...defaultChat,
        id: "a45",
        name: "",
        motd: "",
        notifications: 2,
        typing_indicator: mockIndicator(mock_users[1].key),
        users: [defaultUser.key, mock_users[1].key],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        ...defaultChat,
        id: "s12",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[2].key],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        ...defaultChat,
        id: "12s",
        name: "",
        motd: "",
        notifications: 13,
        users: [defaultUser.key, mock_users[3].key],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        ...defaultChat,
        id: "as5",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[4].key],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
]

function mockIndicator(user: string): TypingIndicator {
    let indicator = new TypingIndicator()
    indicator.add(user)
    return indicator
}

mock_chats[0].id = hashChat(mock_chats[0])
mock_chats[1].id = hashChat(mock_chats[1])
mock_chats[2].id = hashChat(mock_chats[2])
mock_chats[3].id = hashChat(mock_chats[3])
mock_chats[4].id = hashChat(mock_chats[4])
mock_chats[5].id = hashChat(mock_chats[5])

export let mchats = mock_chats
