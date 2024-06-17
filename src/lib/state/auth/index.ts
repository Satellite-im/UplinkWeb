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
            scramblePin: false
        })
    }

    setScrambleValue(scramble: boolean) {
        this.state.update(auth => { 
            auth.scramblePin = scramble 
            return auth
        })
    }

    setStoredPin(pin: string) {
        this.state.update(auth => { 
            auth.pin = pin 
            return auth
        })
    }
}

export const AuthStore = new Auth()
