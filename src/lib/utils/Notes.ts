export class Notes {
    set(key: string, value: string) {
        localStorage.setItem(`note-${key}`, value)
    }

    get(key: string): string {
        let val = localStorage.getItem(`note-${key}`)
        return val ? val : ""
    }
}
