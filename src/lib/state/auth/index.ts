import { writable, type Writable } from "svelte/store"

export type Authentication = {
    pin: string
    scramblePin: boolean
}

class Auth {
    state: Writable<Authentication>

    constructor() {
        this.state = writable({
            pin: "",
            scramblePin: true
        })
    }

    setStoredPin(pin: string) {
        // this.state.pin.update((p) => { p = pin })
    }
}

export const AuthStore = new Auth()
