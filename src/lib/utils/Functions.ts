import { Color, Format } from "$lib/enums"
import TimeAgo from "javascript-time-ago"

export const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

export function getTimeAgo(dateInput: string | Date) {
    const timeAgo = new TimeAgo("en-US")

    const date: Date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return timeAgo.format(date)
}

export function formatStyledText(text: string): string {
    let formattedText = ""
    let currentStyles: string[] = []
    let isFormatting = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]

        if (char === "&" && i + 1 < text.length) {
            const code = `&${text[i + 1]}`
            i++ // Skip the next character as it's part of the code

            if (Object.values(Color).includes(code as Color)) {
                currentStyles = currentStyles.filter(style => !style.startsWith("color-"))
                if (code !== Color.RESET) {
                    currentStyles.push(`color-${code.replace("&", "")}`)
                } else {
                    currentStyles = []
                }
            } else if (Object.values(Format).includes(code as Format)) {
                if (code === Format.RESET) {
                    currentStyles = []
                } else {
                    const formatClass = `format-${code.replace("&", "")}`
                    if (!currentStyles.includes(formatClass)) {
                        currentStyles.push(formatClass)
                    }
                }
            }

            isFormatting = true
        } else {
            if (isFormatting || formattedText === "") {
                if (formattedText) {
                    formattedText += "</span>"
                }
                formattedText += `<span class="${currentStyles.join(" ")}">`
                isFormatting = false
            }

            formattedText += char
        }
    }

    if (formattedText) {
        formattedText += "</span>"
    }

    return formattedText
}
