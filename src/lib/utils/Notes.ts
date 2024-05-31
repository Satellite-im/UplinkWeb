export class Notes {

    set(key: string, value: string) {
        localStorage.setItem(`note-${key}`, value)
    }

    get(key: string): string | null {
        return localStorage.getItem(`note-${key}`)
    }
}