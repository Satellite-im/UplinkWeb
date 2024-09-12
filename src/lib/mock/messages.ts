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
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
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
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: [],
                inReplyTo: null,
                reactions: {},
                attachments: [
                    {
                        kind: MessageAttachmentKind.Image,
                        name: "Library.avif",
                        location: "/assets/mock/library.avif",
                        size: 1291235,
                    },
                    {
                        kind: MessageAttachmentKind.File,
                        name: "Unreal.docx",
                        location: "",
                        size: 284012384,
                    },
                ],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["This is another message"],
                inReplyTo: null,
                reactions: {},
                attachments: [
                    {
                        kind: MessageAttachmentKind.Text,
                        name: "TextDocument.svelte",
                        location: "remote",
                        size: 35,
                    },
                ],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["This is another message"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["And one last message"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
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
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: [],
                inReplyTo: null,
                reactions: {},
                attachments: [
                    {
                        kind: MessageAttachmentKind.STL,
                        name: "3DBenchy.stl",
                        location: "/assets/mock/3DBenchy.stl",
                        size: 1130000,
                    },
                ],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: [],
                inReplyTo: null,
                reactions: {},
                attachments: [
                    {
                        kind: MessageAttachmentKind.Audio,
                        name: "Sample.mp3",
                        location: "/assets/mp3/sample.mp3",
                        size: 1130000,
                    },
                ],
                pinned: false,
            },
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["I am not an alien."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },

    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Hmm, okay!"],
                inReplyTo: {
                    id: uuidv4(),
                    details: {
                        at: new Date(),
                        origin: mock_users[1].key,
                        remote: true,
                    },
                    text: ["I am not an alien."],
                    inReplyTo: null,
                    reactions: {},
                    attachments: [],
                    pinned: false,
                },
                reactions: {},
                attachments: [],
                pinned: true,
            },
        ],
    },
]

export let mock_dm1: Message[] = [
    // First message from Kevin
    {
        details: {
            at: "9/10/24 13:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 13:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["You ever been camping?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/10/24 13:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 13:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Yeah, a few times. Why?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Kevin
    {
        details: {
            at: "9/10/24 13:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 13:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["Thinking of going soon, and I’m trying to figure out where."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/10/24 13:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 13:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nice! I’ve heard the state park is a good spot."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Kevin
    {
        details: {
            at: "9/10/24 13:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 13:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["That’s what I’ve been hearing too. Maybe I’ll check it out."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/10/24 13:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 13:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Let me know if you want company. I’m always down for camping."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Kevin
    {
        details: {
            at: "9/10/24 16:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 16:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["So, Hugo’s talking about starting a band."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/10/24 16:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 16:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Really? What kind of band?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Kevin
    {
        details: {
            at: "9/10/24 16:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 16:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["Something like alt-rock. He’s been messing around with some instruments."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/10/24 16:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 16:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That sounds cool. Are you joining?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Kevin
    {
        details: {
            at: "9/10/24 16:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 16:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["I might. Just gotta see if I can keep up, haha."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/10/24 16:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/10/24 16:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’m sure you’ll do fine."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Kevin
    {
        details: {
            at: "9/11/24 13:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/11/24 13:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["You ever tried Indian food?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/11/24 13:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/11/24 13:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Yeah, I love it. Why?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Kevin
    {
        details: {
            at: "9/11/24 13:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/11/24 13:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["I’ve been thinking of trying the Indian place in town, but I’ve never had it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: "9/11/24 13:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/11/24 13:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["You should definitely go! I’ll come with if you want."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Ninth message from Kevin
    {
        details: {
            at: "9/11/24 13:00",
            origin: mock_users[1].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/11/24 13:00",
                    origin: mock_users[1].key,
                    remote: true,
                },
                text: ["Sounds like a plan. Let’s go this weekend."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: "9/11/24 13:00",
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: "9/11/24 13:00",
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’m in!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm2: Message[] = [
    // First message from Sara
    {
        details: {
            at: new Date(),
            origin: mock_users[2].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["Guess who just got accepted into grad school!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["No way! Congrats!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Sara
    {
        details: {
            at: new Date(),
            origin: mock_users[2].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["Thanks! I’m freaking out a little, but it’s so exciting."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["You’re going to crush it. What’s your program again?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Sara
    {
        details: {
            at: new Date(),
            origin: mock_users[2].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["Environmental Science. Gonna save the planet, one paper at a time."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I believe in you!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Sara
    {
        details: {
            at: new Date(),
            origin: mock_users[2].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["Have you ever been skydiving?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nope, but I want to. You?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Sara
    {
        details: {
            at: new Date(),
            origin: mock_users[2].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["Not yet, but Sheldon and I are thinking of going."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s insane! When?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final message from Sara
    {
        details: {
            at: new Date(),
            origin: mock_users[2].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[2].key,
                    remote: true,
                },
                text: ["Maybe next month. You should come!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’m in. Let’s do it!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm3: Message[] = [
    // First message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["I’ve been getting really into hiking lately."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s awesome. Where have you been hiking?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Mostly local trails, but I’m thinking of hitting up some bigger ones soon."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sounds like fun. Let me know if you ever want a hiking buddy."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Definitely! We should plan something soon."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["So, I tried that new burger place today."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["How was it?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Honestly, it was just okay. A bit overhyped."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s disappointing. I’ve heard mixed reviews."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Yeah, probably won’t be going back anytime soon."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Good to know. I’ll steer clear."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Thinking of getting a new tattoo."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nice! What are you thinking of getting?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Not sure yet, maybe something space-themed."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That would be cool. Have you picked an artist?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final message from Phill
    {
        details: {
            at: new Date(),
            origin: mock_users[3].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[3].key,
                    remote: true,
                },
                text: ["Not yet. I’m still looking around."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Let me know when you do!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm4: Message[] = [
    // First message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["You going to the gym today?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Was thinking about it. You?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Yeah, I need to get a good workout in. Luis might join too."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sounds good. What time?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Around 6. Let’s do it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’ll be there."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["You get that project done for work?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Not yet. Still plugging away."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Same here. I swear I’m going cross-eyed staring at this screen."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I feel that. Coffee break?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Yes, please. Let’s go in 10."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Any plans for the weekend?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Not yet. What about you?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Thinking of checking out that new club downtown. Wendy said it’s pretty cool."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’ve heard good things. I might join."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final message from Darius
    {
        details: {
            at: new Date(),
            origin: mock_users[4].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[4].key,
                    remote: true,
                },
                text: ["Let me know. Should be a fun night."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm5: Message[] = [
    // First message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["I’m thinking about building a custom PC. Any advice?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sure! What’s your budget?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["Around $1,500. I want something that can handle gaming and video editing."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s a solid budget. I’ll help you pick out parts."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["Awesome! I appreciate it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["You ever tried rock climbing?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Not yet. You?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["Went for the first time last weekend. It was tough but fun."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sounds challenging. Did you like it?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["Yeah, I’m thinking of going again."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I might have to try it with you."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["You catch the soccer game last night?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nah, missed it. Was it good?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["Epic! Last-minute goal to win."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sounds like I need to watch the highlights."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final message from Hugo
    {
        details: {
            at: new Date(),
            origin: mock_users[5].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[5].key,
                    remote: true,
                },
                text: ["Definitely. I’ll send you the link."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Appreciate it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm6: Message[] = [
    // First message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["So, I’m officially signed up for that 10K run."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["No way! That’s awesome!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["I’m nervous though. It’s a lot longer than I’m used to."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["You’ll do great. You’ve been training hard."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["Thanks, I hope so. Maybe you can come cheer me on."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Absolutely, I wouldn’t miss it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["You still interested in doing that escape room next weekend?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Definitely! Who’s going?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["Just me, Lucas, and Sheldon so far."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sounds fun! I’ll join."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["Awesome! I’ll book it then."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Can’t wait!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["I tried making sushi for the first time last night."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["How did it turn out?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["Surprisingly well! I didn’t mess up the rice, at least."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s the hardest part, right?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Ninth message from Wendy
    {
        details: {
            at: new Date(),
            origin: mock_users[6].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[6].key,
                    remote: true,
                },
                text: ["Exactly. I might have to make it again soon."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’m down to try it!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm7: Message[] = [
    // First message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["I just finished that book you recommended."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nice! What did you think?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["It was good, but the ending threw me off. I didn’t expect that twist."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Yeah, that’s what got me too. It was unexpected."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["Totally. Any other recommendations?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’ve got a few more, I’ll send you a list."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["Sara’s birthday is next week. Got any gift ideas?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Oh man, that snuck up on me. No idea."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["She mentioned she’s into plants lately."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Perfect, maybe a cool plant or some nice pots."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["Good call. I’ll start looking."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["I’m thinking of learning to play the guitar."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s awesome! Acoustic or electric?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["Probably acoustic to start. I want to see if I can get the basics down first."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Smart. I’ve heard Darius plays a bit too."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Ninth message from Lucas
    {
        details: {
            at: new Date(),
            origin: mock_users[7].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[7].key,
                    remote: true,
                },
                text: ["Really? Maybe I’ll hit him up for tips."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm8: Message[] = [
    // First message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["You still down for that movie marathon this weekend?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Absolutely! What’s on the list?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["I’ve got a mix. Some action, some comedy, and of course, horror."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nice! I’ll bring snacks."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["Perfect. See you Saturday."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Looking forward to it!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["Did you see the lineup for the music festival?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Yeah! Looks amazing. You going?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["Definitely. Wendy and Hugo are coming too."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I might have to join you guys."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["You should. It’s gonna be a blast."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’ll grab a ticket."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["Phill is getting really into photography."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s cool. What kind of stuff is he shooting?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["Landscapes mostly. He’s even thinking of taking a class."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Sounds like a fun hobby."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Ninth message from Luis
    {
        details: {
            at: new Date(),
            origin: mock_users[8].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[8].key,
                    remote: true,
                },
                text: ["Yeah, he’s been dragging me along on his photo walks."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Haha, sounds like Phill."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm9: Message[] = [
    // First message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["You still thinking about joining that soccer league?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Yeah, I’m interested. You playing?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Definitely. Phill’s already signed up too."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I might have to join then."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Do it! It’ll be fun to get the whole crew playing."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["I’ll check it out."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Did you hear about Wendy’s new puppy?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["No way! What kind of dog?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["She got a little mix, some kind of terrier. Super cute."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s awesome. I’ll have to meet it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Yeah, she’s bringing him to Phill’s barbecue this weekend."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Can’t wait to see him!"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Got any travel plans coming up?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Nothing concrete. You?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Thinking of doing a road trip with Jeff and Luis."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That sounds fun! Where to?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Ninth message from Sheldon
    {
        details: {
            at: new Date(),
            origin: mock_users[9].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[9].key,
                    remote: true,
                },
                text: ["Probably up the coast. Lots of good hiking spots along the way."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Count me jealous."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]

export let mock_dm10: Message[] = [
    // First message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["Thinking of getting a new bike, what do you think?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s awesome! Road bike or mountain?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Second message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["Probably a road bike. Lucas got one last week, and it looks solid."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["That’s cool. Planning any long rides?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Third message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["Yeah, I want to hit the new trail by the lake. You in?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Count me in. Let’s do it this weekend."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fourth message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["You talked to Phill lately? He’s been weird."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["What do you mean?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Fifth message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["Just super quiet. I’m used to him cracking jokes nonstop."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Maybe he’s going through something."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Sixth message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["Could be. I’ll hit him up and see if he wants to grab a drink."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Let me know what he says. I’ll join you guys if he’s up for it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Seventh message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["You see the new Marvel trailer?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Not yet. Is it good?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Eighth message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["It looks epic. The visuals are insane."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Might have to check it out. Which movie is it for?"],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Ninth message from Jeff
    {
        details: {
            at: new Date(),
            origin: mock_users[10].key,
            remote: true,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[10].key,
                    remote: true,
                },
                text: ["The next Avengers. Hugo’s already geeking out over it."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
    // Final response from the recipient
    {
        details: {
            at: new Date(),
            origin: mock_users[0].key,
            remote: false,
        },
        messages: [
            {
                id: uuidv4(),
                details: {
                    at: new Date(),
                    origin: mock_users[0].key,
                    remote: false,
                },
                text: ["Of course he is. I’ll watch it tonight."],
                inReplyTo: null,
                reactions: {},
                attachments: [],
                pinned: false,
            },
        ],
    },
]
