import type { Shape } from "$lib/enums"

export class ToastMessage {
    title: string
    content: string
    remaining_time: number
    icon: Shape | undefined
    // internal. used for resetting the timer
    initial_time: number

    constructor(title: string, content: string, remaining_time: number, icon?: Shape) {
        this.title = title
        this.content = content
        this.remaining_time = remaining_time
        this.icon = icon
        this.initial_time = remaining_time
    }
}
