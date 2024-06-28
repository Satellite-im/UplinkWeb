// Unicode emoji regex pattern
export const emojiRegex: RegExp =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2B50}-\u{2B55}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]/gu

export function wrapEmoji(input: string, left: string = `<span class="emoji">`, right: string = `</span>`): string {
    return input.replace(emojiRegex, match => `${left}${match}${right}`)
}
