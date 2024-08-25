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
