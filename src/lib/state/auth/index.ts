import { get, writable, type Writable } from "svelte/store"
import { createPersistentState } from "../db/persistedState"
import { getStateFromDB } from "../db/dbOperations"

export type Authentication = {
    pin: string
    scramblePin: boolean
}

class Auth {
    state: Writable<Authentication>

    constructor() {
        this.state = createPersistentState<Authentication>("uplink.auth", {
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
        console.log("Setting pin: " + pin)
        this.state.set({ pin: pin, scramblePin: true })
    }

    async getStoredPin(): Promise<string> {
        let state = await getStateFromDB<Authentication>("uplink.auth", {
            pin: "",
            scramblePin: false
        })
        console.log("Getting pin: " + state.pin)
        return state.pin
    }
}

export const AuthStore = new Auth()
