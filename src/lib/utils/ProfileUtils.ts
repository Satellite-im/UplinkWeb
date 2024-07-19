import { Identicon } from "$lib/enums"
import {
    avataaars, avataaarsNeutral, bottts, botttsNeutral,
    icons, identicon, lorelei, notionists, openPeeps, pixelArt,
    pixelArtNeutral, shapes
} from "@dicebear/collection"

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