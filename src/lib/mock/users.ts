import { ChatType, Integrations, Status } from "$lib/enums"
import { defaultUser, type Chat, type User, hashChat, defaultChat, TypingIndicator } from "$lib/types"
import { get } from "svelte/store"
import { Store } from "$lib/state/Store"

export const mock_users: Array<User> = [
    {
        ...defaultUser,
        name: "CurrentUser",
        key: "did:key:z6MkeWmuqj64znsaPPfqUJwuSSfMLupuDo7ygoqGefednD8t",
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
        name: "Kevin Keppler",
        key: "did:key:z4MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        id: {
            short: "EGta2doK",
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
        key: "did:key:teZ2GpumzDYTCiltzFrQ5hMjgASE0AHlifIp6KDLJoWtZpmv",
        id: {
            short: "JoWtZpmv",
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
        key: "did:key:UvDDl46rclywiu0iMxp9VqSKnkKnVplotuK68aWHjLkabmeH",
        id: {
            short: "jLkabmeH",
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
        key: "did:key:cQ5Y9rGs3lyrYELJBnbirUk9L6Ztn0Y0TH0kvjplABEOGZgS",
        id: {
            short: "ABEOGZgS",
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
            status: Status.Offline,
            status_message: "This is a status message that you are reading.",
        },
    },
    {
        ...defaultUser,
        name: "HyperHugo",
        key: "did:key:huMy9BBBBplCrAK5YmQo0biTsCyUgTSCMIii03MktwE217gD",
        id: {
            short: "twE217gD",
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
    {
        ...defaultUser,
        name: "Whirlwind Wendy",
        key: "did:key:kFmZVe2AxJb2BjU07ZzOmxh6iAH3Fj1vKb5lkmnzeIHqdYcA",
        id: {
            short: "eIHqdYcA",
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
            status_message: "This is a status message that you are reading.",
        },
    },
    {
        ...defaultUser,
        name: "Lunar Lucas",
        key: "did:key:KrmKwDhUlm5FHEgvQuJvEyRjeaQATAXmkAh89Z8zBiRQ4qom",
        id: {
            short: "BiRQ4qom",
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
            status_message: "This is a status message that you are reading.",
        },
    },
    {
        ...defaultUser,
        name: "Luis Laserbeam",
        key: "did:key:XaaeMyj22XIHu8J8vl7AYgRpRzaCLQCAmVaFci5x3VThDAke",
        id: {
            short: "3VThDAke",
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
    {
        ...defaultUser,
        name: "Cosmic Shelly",
        key: "did:key:wFyhpbbRod0LEmMyVe8LDLobf8lgYkUUHsoh8IRZ7sCpYuVl",
        id: {
            short: "7sCpYuVl",
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
            status_message: "This is a status message that you are reading.",
        },
    },
    {
        ...defaultUser,
        name: "Astro Jeff",
        key: "did:key:UA2cAdfrUCe4Diy9RgpXQj6q5a77MxPKUu9prqorMEGfkCrb",
        id: {
            short: "MEGfkCrb",
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
            status: Status.Offline,
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
        last_message_at: "9/12/2024 10:30",
        last_message_preview: "Hmm, okay!",
    },
    {
        ...defaultChat,
        id: "a45",
        name: "",
        motd: "",
        notifications: 2,
        typing_indicator: mockIndicator(mock_users[1].key),
        users: [mock_users[0].key, mock_users[1].key],
        last_message_at: "9/12/2024 10:00",
        last_message_preview: "I'm in!",
    },
    {
        ...defaultChat,

        id: "s12",
        name: "",
        motd: "",
        notifications: 0,
        users: [mock_users[0].key, mock_users[2].key],
        last_message_at: "9/11/2024 22:00",
        last_message_preview: "I'm in. Let's do it!",
    },
    {
        ...defaultChat,
        id: "12s",
        name: "",
        motd: "",
        notifications: 13,
        users: [mock_users[0].key, mock_users[3].key],
        last_message_at: "9/11/2024 18:45",
        last_message_preview: "Let me know when you do!",
    },
    {
        ...defaultChat,
        id: "as5",
        name: "",
        motd: "",
        notifications: 0,
        users: [mock_users[0].key, mock_users[4].key],
        last_message_at: "9/11/2024 18:30",
        last_message_preview: "Let me know. Should be a fun night.",
    },
    {
        ...defaultChat,
        id: "op23",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[5].key],
        last_message_at: "9/11/2024 18:00",
        last_message_preview: "Appreciate it.",
    },
    {
        ...defaultChat,
        id: "op24",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[6].key],
        last_message_at: "9/10/2024 17:30",
        last_message_preview: "I'm down to try it!",
    },
    {
        ...defaultChat,
        id: "op25",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[7].key],
        last_message_at: "9/10/2024 17:00",
        last_message_preview: "Really? Maybe I’ll hit him up for tips.",
    },
    {
        ...defaultChat,
        id: "op26",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[8].key],
        last_message_at: "9/10/2024 16:00",
        last_message_preview: "Haha, sounds like Phill.",
    },
    {
        ...defaultChat,
        id: "op27",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[9].key],
        last_message_at: "9/10/2024 15:00",
        last_message_preview: "Count me jealous.",
    },
    {
        ...defaultChat,
        id: "op28",
        name: "",
        motd: "",
        notifications: 0,
        users: [defaultUser.key, mock_users[10].key],
        last_message_at: "9/10/2024 14:00",
        last_message_preview: "Of course he is. I’ll watch it tonight.",
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
mock_chats[6].id = hashChat(mock_chats[6])
mock_chats[7].id = hashChat(mock_chats[7])
mock_chats[8].id = hashChat(mock_chats[8])
mock_chats[9].id = hashChat(mock_chats[9])
mock_chats[10].id = hashChat(mock_chats[10])

export let mchats = mock_chats
