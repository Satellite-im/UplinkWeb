import { get, writable, type Writable } from "svelte/store"
import { createPersistentState } from "../db/persistedState"
import { getStateFromDB } from "../db/dbOperations"
import { log } from "$lib/utils/Logger"

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
        this.state.update(auth => { 
            auth.pin = pin 
            return auth
        })
    }

    async getStoredPin(): Promise<string> {
        let state = await getStateFromDB<Authentication>("uplink.auth", {
            pin: "",
            scramblePin: false
        })
        return state.pin
    }
}

export const AuthStore = new Auth()
