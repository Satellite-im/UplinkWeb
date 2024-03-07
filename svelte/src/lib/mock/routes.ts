import { Route, Shape } from "$lib/enums";
import type { NavRoute } from "$lib/types";

export let routes: NavRoute[] = [
    {
        to: Route.Chat,
        icon: Shape.ChatBubble,
        name: "Chat"
    },
    {
        to: Route.Files,
        icon: Shape.Folder,
        name: "Files"
    },
    {
        to: Route.Files,
        icon: Shape.Folder,
        name: "Files"
    },
    {
        to: Route.Wallet,
        icon: Shape.Cog,
        name: "Wallet"
    },
    {
        to: Route.Settings,
        icon: Shape.Cog,
        name: "Settings"
    },
];