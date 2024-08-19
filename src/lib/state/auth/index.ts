import { get, type Writable } from "svelte/store"
import { createPersistentState, createSessionState } from "../db/persistedState"
import { getStateFromDB } from "../db/dbOperations"
import { TesseractStoreInstance } from "$lib/wasm/TesseractStore"
import { log } from "$lib/utils/Logger"
import { Route } from "$lib/enums"
import { goto } from "$app/navigation"
import { RelayStore } from "../wasm/relays"
import { WarpStore } from "$lib/wasm/WarpStore"
import { MultipassStoreInstance } from "$lib/wasm/MultipassStore"

export type Authentication = {
    pin: string
    scramblePin: boolean
    stayLoggedIn: boolean
    saveSeedPhrase: boolean
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
            saveSeedPhrase: true,
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

    setSaveSeedPhrase(save: boolean) {
        if (save) {
            this.state.update(auth => {
                auth.saveSeedPhrase = true
                return auth
            })
        } else {
            this.state.update(auth => {
                auth.saveSeedPhrase = false
                TesseractStoreInstance.removeSeed()
                return auth
            })
        }
    }

    logIn(flag: boolean) {
        this.loggedIn.set(flag)
    }

    async getAuthentication(): Promise<Authentication> {
        let state = await getStateFromDB<Authentication>("uplink.auth", {
            pin: "",
            scramblePin: false,
            saveSeedPhrase: false,
            stayLoggedIn: false,
        })
        return state
    }
}

export const AuthStore = new Auth()

export async function checkIfUserIsLogged(page: string | null, redirect?: boolean) {
    log.debug("Checking if user is logged")
    await TesseractStoreInstance.initTesseract()
    let authentication = await AuthStore.getAuthentication()
    if (authentication.pin === "") {
        log.info("No pin stored, redirecting to unlock")
        goto(Route.Unlock)
    } else if (page !== Route.Unlock) {
        // We need to find a better way of handling it so the password doesnt get stored
        // But for now: dont login if the user is on the login page
        let logged_in = get(AuthStore.loggedIn)
        if (!authentication.stayLoggedIn && !logged_in) {
            goto(Route.Unlock)
        } else {
            let addressed = Object.values(get(RelayStore.state))
                .filter(r => r.active)
                .map(r => r.address)
            await WarpStore.initWarpInstances(addressed)
            log.info("Pin stored, unlocking")
            let result = await TesseractStoreInstance.unlock(authentication.pin)
            result.onSuccess(() => {
                setTimeout(() => MultipassStoreInstance.initMultipassListener(), 1000)
            })
            if (redirect) goto(Route.Chat)
        }
    }
}
