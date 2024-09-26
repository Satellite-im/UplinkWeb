import type { Shape } from "$lib/enums"
import { Appearance } from "$lib/enums"

export class ToastMessage {
    title: string
    content: string
    remaining_time: number
    icon: Shape | undefined
    appearance: Appearance = Appearance.Default
    onclick?: () => void
    // internal. used for resetting the timer
    initial_time: number

    constructor(title: string, content: string, remaining_time: number, icon?: Shape, appearance?: Appearance, onclick?: () => void) {
        this.title = title
        this.content = content
        this.remaining_time = remaining_time
        this.icon = icon
        this.appearance = appearance || Appearance.Default
        this.initial_time = remaining_time
        this.onclick = onclick
    }
}
