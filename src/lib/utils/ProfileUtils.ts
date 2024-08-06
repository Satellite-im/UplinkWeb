import { Identicon, Integrations } from "$lib/enums"
import { avataaars, avataaarsNeutral, bottts, botttsNeutral, icons, identicon, lorelei, notionists, openPeeps, pixelArt, pixelArtNeutral, shapes } from "@dicebear/collection"

export function getIdenticonGenerator(identiconStyle: Identicon) {
    switch (identiconStyle) {
        case Identicon.Avataaars:
            return avataaars
        case Identicon.AvataaarsNeutral:
            return avataaarsNeutral
        case Identicon.Bots:
            return bottts
        case Identicon.BotsNeutral:
            return botttsNeutral
        case Identicon.Icons:
            return icons
        case Identicon.Identicon:
            return identicon
        case Identicon.Lorelei:
            return lorelei
        case Identicon.Notionists:
            return notionists
        case Identicon.OpenPeeps:
            return openPeeps
        case Identicon.PixelArt:
            return pixelArt
        case Identicon.PixelArtNeutral:
            return pixelArtNeutral
        case Identicon.Shapes:
            return shapes
        default:
            return Identicon.Identicon
    }
}

function hashStringToSeed(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0
    }
    return hash
}

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

export function identityColor(key: string): string {
    const seed = hashStringToSeed(key)
    const r = Math.floor(seededRandom(seed) * 256)
    const g = Math.floor(seededRandom(seed + 1) * 256)
    const b = Math.floor(seededRandom(seed + 2) * 256)

    const toHex = (num: number) => {
        const hex = num.toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getIntegrationColor(key: string): string {
    switch (toIntegrationKind(key)) {
        case Integrations.BTC:
            return "#F7931A"
        case Integrations.ETH:
            return "#215CAF"
        case Integrations.SOL:
            return "#9945FF"
        case Integrations.Spotify:
            return "#1DB954"
        case Integrations.Steam:
            return "#66c0f4"
        case Integrations.Twitch:
            return "#6441a5"
        case Integrations.YouTube:
            return "#cc181e"
        default:
            return "#FF7F50"
    }
}

export function toIntegrationKind(key: string): Integrations {
    let integration_kind = Integrations[key as keyof typeof Integrations]
    if (integration_kind === undefined) {
        integration_kind = Integrations.Generic
    }
    return integration_kind
}

export function toIntegrationIconSrc(key: string): string {
    return `/assets/brand/${toIntegrationKind(key)}.png`
}
