import { corePermissions } from "$lib/defaults/community/Permissions"
import { CommunityChannelKind, Shape } from "$lib/enums"
import { PermissionCategory, PermissionState } from "$lib/enums/community"
import type { CommunityChannelGroup, Member, Role } from "$lib/types"
import { mock_users } from "./users"

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

export let mockTags = [
    { name: "Programming", color: "#706fd3" },
    { name: "Design", color: "#b33939" },
    { name: "Music", color: "#cd6133" },
    { name: "Art", color: "#01a3a4" },
    { name: "Photography", color: "#c44569" },
    { name: "Writing", color: "#3ae374" },
    { name: "Gaming", color: "#ff6b6b" },
    { name: "Movies", color: "#EAB543" },
    { name: "Books", color: "#6F1E51" },
    { name: "Sports", color: "#10ac84" },
]

export const mockRoles: Role[] = [
    {
        id: "admin",
        name: "Administrator",
        level: 5,
        description: "Admins have access to all permissions in the community.",
        color: "#ffd32a",
        permissions: corePermissions.map(obj => ({
            ...obj,
            state: PermissionState.Allowed,
        })), // Load all core permissions and set to allowed
    },
    {
        id: "mod",
        name: "Moderator",
        level: 4,
        description: "Moderators have access to kick users, timeout users, and delete messages.",
        color: "#B53471",
        permissions: [
            {
                id: "delete-messages",
                category: PermissionCategory.Messages,
                description: "Delete messages in the community",
                state: PermissionState.Allowed,
            },
            {
                id: "kick-members",
                category: PermissionCategory.Members,
                description: "Kick members from the community",
                state: PermissionState.Allowed,
            },
            {
                id: "ban-members",
                category: PermissionCategory.Members,
                description: "Ban members from the community",
                state: PermissionState.Allowed,
            },
            {
                id: "timeout-members",
                category: PermissionCategory.Members,
                description: "Timeout members from the community",
                state: PermissionState.Allowed,
            },
            {
                id: "nickname-members",
                category: PermissionCategory.Members,
                description: "Nickname members in the community",
                state: PermissionState.Allowed,
            },
            {
                id: "mute-members",
                category: PermissionCategory.Channels,
                description: "Mute members in the community",
                state: PermissionState.Allowed,
            },
            {
                id: "deafen-members",
                category: PermissionCategory.Channels,
                description: "Deafen members in the community",
                state: PermissionState.Allowed,
            },
            {
                id: "disconnect-members",
                category: PermissionCategory.Channels,
                description: "Disconnect members from voice chat",
                state: PermissionState.Allowed,
            },
        ],
    },
]

export const mockCommunityMembers: Member[] = [
    {
        user: mock_users[0],
        roles: [mockRoles[0]],
        permissions: [],
        tags: [mockTags[0], mockTags[1]],
        meta: {
            join: new Date(),
        },
    },
    {
        user: mock_users[1],
        roles: [mockRoles[1]],
        permissions: [],
        tags: [mockTags[2], mockTags[3], mockTags[4], mockTags[5]],
        meta: {
            join: new Date(),
        },
    },
]
