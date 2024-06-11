import { CommunityChannelKind, Shape } from "$lib/enums";
import type { CommunityChannelGroup } from "$lib/types";

export let communityChannelGroups: CommunityChannelGroup[] = [
    {
        name: "Text",
        channels: [
            {
                icon: Shape.Hashtag,
                name: "General",
                kind: CommunityChannelKind.Text,
            },
            {
                icon: Shape.Hashtag,
                name: "Story Time",
                kind: CommunityChannelKind.Text,
            },
            {
                icon: Shape.Hashtag,
                name: "Dev Updates",
                kind: CommunityChannelKind.Text,
            },
        ],
    },
    {
        name: "Voice Chats",
        channels: [
            {
                icon: Shape.SpeakerWaveMax,
                name: "Voice 1",
                kind: CommunityChannelKind.Voice,
            },
        ],
    },
    {
        name: "Misc",
        channels: [
            {
                icon: Shape.Folder,
                name: "Pic Dump",
                kind: CommunityChannelKind.Files,
            },
            {
                icon: Shape.Folder,
                name: "Game Mods",
                kind: CommunityChannelKind.Files,
            },
        ],
    },
]