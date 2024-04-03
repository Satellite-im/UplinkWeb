import { defaultUser, type Chat, type User, defaultChat } from "$lib/types"
import { writable, type Writable } from "svelte/store"

interface IState {
    user: Writable<User>,
    activeChat: Writable<Chat>,
    ui: {
        color: Writable<string>,
        fontSize: Writable<number>,
        cssOverride: Writable<string>
    }
}

const initialState: IState = {
    user: writable(defaultUser),
    activeChat: writable(defaultChat),
    ui: {
        color: writable("#4d4dff"),
        fontSize: writable(1.0),
        cssOverride: writable("")
    }
}

class GlobalStore {
    state: IState

    constructor(state: IState) {
        this.state = {...state}
    }

    setCssOverride(css: string) {
        this.state.ui.cssOverride.set(css)
    }

    setThemeColor(color: string) {
        this.state.ui.color.set(color)
    }

    increaseFontSize(amount: number = 0.025) {
        this.state.ui.fontSize.update((s) => {
            if (s + amount <= 1.5) {
                return s += amount
            }
            return s
        })
    }

    decreaseFontSize(amount: number = 0.025) {
        this.state.ui.fontSize.update((s) => {
            if (s - amount >= 0.8) {
                return s -= amount
            }
            return s
        })
    }
}

export const Store = new GlobalStore(initialState);
