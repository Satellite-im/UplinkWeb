import { type Writable } from "svelte/store"
import { createPersistentState, createSessionState } from "../db/persistedState"
import { getStateFromDB } from "../db/dbOperations"

export type Authentication = {
    pin: string
    scramblePin: boolean
    stayLoggedIn: boolean
    seedPhrase?: string[]
}

class Auth {
    state: Writable<Authentication>
    // Flag for the current session whether the user logged in or not.
    // This stops needing to unlock again when the page is reloaded
    loggedIn: Writable<boolean>

    constructor() {
        this.state = createPersistentState<Authentication>("uplink.auth", {
            pin: "",
            scramblePin: false,
            stayLoggedIn: true,
        })
        this.loggedIn = createSessionState(
            "uplink.auth.loggedIn",
            false,
            b => `${b}`,
            b => (b === "true" ? true : false)
        )
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

    setSeedPhrase(seedPhrase: string[]) {
        this.state.update(auth => {
            auth.seedPhrase = seedPhrase
            return auth
        })
    }

    logIn(flag: boolean) {
        this.loggedIn.set(flag)
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
