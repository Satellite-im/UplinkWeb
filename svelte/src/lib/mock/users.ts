import { Appearance, Status } from "$lib/enums";
import type { Chat, User } from "$lib/types";

const default_user = function(): User {
    return {  
        key: "did:key:000",
        name: "Default User",
        profile: {
            photo: {
                image: "/lib/assets/moon.png",
            },
            status: Status.Offline,
            status_message: "Default status message"
        }
    };
}

export const mock_users: Array<User> = [
    {
        ...default_user(),
        name: "Lunar Lucas",
        key: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        profile: {
            photo: {
                image: "/src/lib/assets/moon.png"
            },
            status: Status.Idle,
            status_message: "There is no cheese on this moon."
        }
    },
    {
        ...default_user(),
        name: "Space Kev",
        key: "did:key:z4MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        profile: {
            photo: {
                image: "/src/lib/assets/blue_marble.png"
            },
            status: Status.Online,
            status_message: "Space Kev is doing Space Kev things!"
        }
    },
    {
        ...default_user(),
        name: "Sara Saturn",
        key: "did:key:z8HkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        profile: {
            photo: {
                image: "/src/lib/assets/saturn.png"
            },
            status: Status.Online,
            status_message: "Testing all of the things, all of the time."
        }
    },
    {
        ...default_user(),
        name: "Pluto Phill",
        key: "did:key:z9EkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        profile: {
            photo: {
                image: "/src/lib/assets/pluto.png"
            },
            status: Status.Offline,
            status_message: "I am also testing a bunch of things a bunch of the time!"
        }
    },
    {
        ...default_user(),
        name: "Daring Darius",
        key: "did:key:z7YkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        profile: {
            photo: {
                image: "/src/lib/assets/neptune.png"
            },
            status: Status.DoNotDisturb,
            status_message: "This is a status message that you are reading."
        }
    }
];


export let chats: Chat[] = [
    {
        name: "",
        notifications: 4,
        users: [mock_users[0]],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "",
        notifications: 2,
        users: [mock_users[1]],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "",
        notifications: 0,
        users: [mock_users[2]],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "",
        notifications: 0,
        users: [mock_users[3]],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        name: "",
        notifications: 0,
        users: [mock_users[4]],
        last_message_at: new Date(),
        last_message_preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
]