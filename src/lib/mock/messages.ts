import { Appearance, MessageAttachmentKind, Shape } from "$lib/enums"
import type { MessageGroup, Message } from "$lib/types"
import { mock_users } from "./users"
import { v4 as uuidv4 } from "uuid"
import { defaultUser } from "$lib/types/index"

export let mock_group: MessageGroup[] = [
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: true,
                },
                text: ["Hello, world!"],
                inReplyTo: null,
                reactions: {
                    "🔥": {
                        emoji: "🔥",
                        highlight: Appearance.Primary,
                        reactors: new Set([mock_users[0].key]),
                        description: ":fire: you and 2 users reacted.",
                    },
                    "🌎": {
                        emoji: "🌎",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[0].key]),
                        description: ":earth: 2 users reacted.",
                    },
                },
                attachments: [],
                pinned: false,
            },
            // Other grouped messages...
        ],
    },
    // Another message group with mock_users[1]
    {
        details: {
            at: new Date(),
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["Hello humans.", "**woah** _it's_ __markdown__ ~~stuff~~."],
                inReplyTo: null,
                reactions: {
                    "👽": {
                        emoji: "👽",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[0].key]),
                        description: ":alien: 2 users reacted.",
                    },
                    "👀": {
                        emoji: "👀",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[0].key]),
                        description: ":eyes: 1 user reacted.",
                    },
                },
                attachments: [
                    {
                        kind: MessageAttachmentKind.File,
                        name: "Unreal.docx",
                        location: "",
                        size: 284012384,
                    },
                ],
                pinned: true,
            },
            // Other messages...
        ],
    },
    // Individual messages added at the end (not part of MessageGroup)
]

export let mock_dm1: MessageGroup[] = [
    {
        details: {
            at: new Date(),
            origin: "did:key:z6MkueJ5Waq9qDgPig27fBbagCCbUYxqcwharjzrMakGCV74",
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: "did:key:z6MkueJ5Waq9qDgPig27fBbagCCbUYxqcwharjzrMakGCV74",
                    remote: false,
                },
                text: ["Hello, my friend!"],
                inReplyTo: null,
                reactions: {
                    "🔥": {
                        emoji: "🔥",
                        highlight: Appearance.Primary,
                        reactors: new Set([mock_users[0].key]),
                        description: ":fire: you and 2 users reacted.",
                    },
                    "🌎": {
                        emoji: "🌎",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[0].key]),
                        description: ":earth: 2 users reacted.",
                    },
                },
                attachments: [],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: true,
                },
                text: ["Hello, my friend!"],
                inReplyTo: null,
                reactions: {
                    "🔥": {
                        emoji: "🔥",
                        highlight: Appearance.Primary,
                        reactors: new Set([mock_users[0].key]),
                        description: ":fire: you and 2 users reacted.",
                    },
                    "🌎": {
                        emoji: "🌎",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[1].key]),
                        description: ":earth: 2 users reacted.",
                    },
                },
                attachments: [],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["Hello humans.", "**woah** _it's_ __markdown__ ~~stuff~~."],
                inReplyTo: null,
                reactions: {
                    "👽": {
                        emoji: "👽",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[0].key]),
                        description: ":alien: 2 users reacted.",
                    },
                    "👀": {
                        emoji: "👀",
                        highlight: Appearance.Default,
                        reactors: new Set([mock_users[0].key]),
                        description: ":eyes: 1 user reacted.",
                    },
                },
                attachments: [
                    {
                        kind: MessageAttachmentKind.File,
                        name: "Unreal.docx",
                        location: "",
                        size: 284012384,
                    },
                ],
                pinned: true,
            },
        ],
    },
]

export function patchOwnDIDInMessages(newKey: string): void {
    // Helper function to update keys within the details and messages
    function updateKeyInGroup(group: MessageGroup[]): void {
        group.forEach(messageGroup => {
            // Update the key in the group details
            if (messageGroup.details.origin === mock_users[0].key) {
                messageGroup.details.origin = newKey
            }

            // Update the key in each message within the group
            messageGroup.messages.forEach(message => {
                if (message.details.origin === mock_users[0].key) {
                    message.details.origin = newKey
                }

                // Update reactors in message reactions
                Object.keys(message.reactions).forEach(reactionKey => {
                    const reaction = message.reactions[reactionKey]
                    if (reaction.reactors.has(mock_users[0].key)) {
                        reaction.reactors.delete(mock_users[0].key)
                        reaction.reactors.add(newKey)
                    }
                })
            })
        })
    }

    // Update mock_group
    updateKeyInGroup(mock_group)

    // Update mock_dm1
    updateKeyInGroup(mock_dm1)
}
