import { type Writable } from "svelte/store"
import { createPersistentState } from "../db/persistedState"
import { getStateFromDB } from "../db/dbOperations"

export type Authentication = {
    pin: string
    scramblePin: boolean
    stayLoggedIn: boolean
}

class Auth {
    state: Writable<Authentication>

    constructor() {
        this.state = createPersistentState<Authentication>("uplink.auth", {
            pin: "",
            scramblePin: false,
            stayLoggedIn: false,
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

    setStayLogged(stayLoggedIn: boolean) {
        this.state.update(auth => {
            auth.stayLoggedIn = stayLoggedIn
            return auth
        })
    }

    async getAuthentication(): Promise<Authentication> {
        let state = await getStateFromDB<Authentication>("uplink.auth", {
            pin: "",
            scramblePin: false,
            stayLoggedIn: false,
        })
        return state
    }
}

export const AuthStore = new Auth()
