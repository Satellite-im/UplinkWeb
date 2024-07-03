export class InputRules {
    minLength: number
    maxLength: number
    required: boolean
    pattern: RegExp | null

    constructor(minLength: number = 0, maxLength: number = 255, required: boolean = false, pattern: RegExp | null = null) {
        this.minLength = minLength
        this.maxLength = maxLength
        this.required = required
        this.pattern = pattern
    }
}
