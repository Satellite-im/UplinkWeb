import { defaultUser, type User } from "$lib/types"
import { derived, writable } from "svelte/store"
import type { Writable } from "svelte/store"

interface IState {
    user: User
}

const initialState: IState = {
    user: defaultUser
}

class GlobalStore {
    constructor() {

    }

    get user(): User {
        return this.user
    }
}

export const Store = new GlobalStore();
