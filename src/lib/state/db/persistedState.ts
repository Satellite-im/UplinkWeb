import { writable } from "svelte/store"
import { getStateFromDB, setStateToDB } from "./dbOperations"

export function createPersistentState<T>(key: string, defaultState: T) {
    const state = writable<T>(defaultState)
    getStateFromDB<T>(key, defaultState).then(loadedState => {
        state.set(loadedState)
        state.subscribe(value => setStateToDB<T>(key, value))
    })
    return state
}

export function createSessionStateFor(key: string, defaultState: string) {
    return createSessionState(
        key,
        defaultState,
        s => s,
        s => s
    )
}

export function createSessionState<T>(key: string, defaultState: T, serializer: (val: T) => string, deserializer: (val: string) => T) {
    const state = writable(defaultState)
    let value = sessionStorage.getItem(key)
    if (value) state.set(deserializer(value))
    state.subscribe(value => {
        console.log("sessiong update ", value, serializer(value))
        sessionStorage.setItem(key, serializer(value))
    })
    return state
}
