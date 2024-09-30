import { smileys_and_emotion } from "./category/smileysAndEmotion"
import { people_and_body } from "./category/peopleAndBody"
import { animals_and_nature } from "./category/animalsAndNature"
import { food_and_drink } from "./category/foodAndDrink"
import { travel_and_places } from "./category/travelAndPlaces"
import { activities } from "./category/activities"
import { objects } from "./category/objects"
import { symbols } from "./category/symbols"
import { flags } from "./category/flags"

export const emojiList = {
    smileys_and_emotion,
    people_and_body,
    animals_and_nature,
    food_and_drink,
    travel_and_places,
    activities,
    objects,
    symbols,
    flags,
}

class EmojiRegex {
    private regex: { [i: string]: RegExp } = {}

    private escapeRegExp(input: string) {
        return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special characters
    }
    getRegexFor(emoji: { name: string; glyph: string; text: string; shortname: string }): RegExp {
        let regex = this.regex[emoji.shortname]
        if (!regex) {
            regex = new RegExp(`(${this.escapeRegExp(emoji.shortname)}|${this.escapeRegExp(emoji.text)})( |$)`)
            this.regex[emoji.shortname] = regex
        }
        return regex
    }
}

export const emojiRegexMap = new EmojiRegex()
