import type { Shape } from "$lib/enums"

export interface Currency {
    name: string
    icon: Shape
    balance: number
    address: string
    enabled: boolean
}
