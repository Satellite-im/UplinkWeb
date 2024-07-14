import { IntegrationDisplays, Integrations, Shape } from "./enums"

export const DEFAULT_CDN = {
    name: "Default CA_TO-1",
    address: "https://cdn.deepspaceshipping.co",
}

export const RETRY_DELAY: number = 1000 // ms
export const MAX_RETRY_COUNT: number = 15

export const INTEGRATIONS = {
    [Integrations.Generic]: {
        name: Integrations.Generic,
        icon: Shape.Hashtag,
        display: IntegrationDisplays.Text
    },
    [Integrations.BTC]: {
        name: Integrations.BTC,
        icon: Shape.Beaker,
        display: IntegrationDisplays.WalletAddress
    },
    [Integrations.ETH]: {
        name: Integrations.ETH,
        icon: Shape.Beaker,
        display: IntegrationDisplays.WalletAddress
    },
    [Integrations.SOL]: {
        name: Integrations.SOL,
        icon: Shape.Beaker,
        display: IntegrationDisplays.WalletAddress
    },
    [Integrations.Twitch]: {
        name: Integrations.Twitch,
        icon: Shape.Beaker,
        display: IntegrationDisplays.URL
    },
    [Integrations.YouTube]: {
        name: Integrations.YouTube,
        icon: Shape.Beaker,
        display: IntegrationDisplays.URL
    },
    [Integrations.Steam]: {
        name: Integrations.Steam,
        icon: Shape.Beaker,
        display: IntegrationDisplays.URL
    },
    [Integrations.Spotify]: {
        name: Integrations.Spotify,
        icon: Shape.Beaker,
        display: IntegrationDisplays.URL
    }
}