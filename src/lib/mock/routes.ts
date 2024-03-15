import { Route, SettingsRoute, Shape } from "$lib/enums";
import type { NavRoute } from "$lib/types";

export let routes: NavRoute[] = [
    {
        to: Route.Wallet,
        icon: Shape.Wallet,
        name: "Wallet"
    },
    {
        to: Route.Files,
        icon: Shape.Folder,
        name: "Files"
    },
    {
        to: Route.Chat,
        icon: Shape.ChatBubble,
        name: "Chat"
    },
    {
        to: Route.Friends,
        icon: Shape.Users,
        name: "Friends"
    },
    {
        to: Route.Settings,
        icon: Shape.Cog,
        name: "Settings"
    },
];

export let settingsRoutes: NavRoute[] = [
    {
        to: SettingsRoute.Profile,
        icon: Shape.Profile,
        name: "Profile"
    },
    {
        to: SettingsRoute.Preferences,
        icon: Shape.Preferences,
        name: "General"
    },
    {
        to: SettingsRoute.Messages,
        icon: Shape.ChatBubble,
        name: "Messages"
    },
    {
        to: SettingsRoute.AudioVideo,
        icon: Shape.Speaker,
        name: "Audio & Video"
    },
    {
        to: SettingsRoute.Extensions,
        icon: Shape.Beaker,
        name: "Extensions"
    },
    {
        to: SettingsRoute.Keybinds,
        icon: Shape.Keybind,
        name: "Keybinds"
    },
    {
        to: SettingsRoute.Accessability,
        icon: Shape.Eye,
        name: "Accessability"
    },
    {
        to: SettingsRoute.Notifications,
        icon: Shape.BellAlert,
        name: "Notifications"
    },
    {
        to: SettingsRoute.About,
        icon: Shape.Info,
        name: "About"
    },
    {
        to: SettingsRoute.Licenses,
        icon: Shape.Document,
        name: "Licenses"
    },
];