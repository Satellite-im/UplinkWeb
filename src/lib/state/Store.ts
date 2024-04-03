import { defaultUser, type Chat, type User, defaultChat } from "$lib/types"
import { writable, type Writable } from "svelte/store"

interface IState {
    user: Writable<User>,
    activeChat: Writable<Chat>,
    ui: {
        color: Writable<string>
    }
}

const initialState: IState = {
    user: writable(defaultUser),
    activeChat: writable(defaultChat),
    ui: {
        color: writable("#4d4dff")
    }
}

class GlobalStore {
    state: IState

    constructor(state: IState) {
        this.state = {...state}
    }

    setThemeColor(color: string) {
        console.log('color', color)
        this.state.ui.color.set(color)
    }
}

export const Store = new GlobalStore(initialState);
