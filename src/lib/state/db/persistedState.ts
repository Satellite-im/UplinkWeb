import { writable } from "svelte/store"
import { getStateFromDB, setStateToDB } from "./dbOperations"

export type DeSerializer<T> = {
    deserializer?: (t: any) => T
    serializer?: (t: T) => any
}

export function createPersistentState<T>(key: string, defaultState: T, deserializer?: DeSerializer<T>) {
    const state = writable<T>(defaultState)
    getStateFromDB<any>(key, defaultState).then(loadedState => {
        if (deserializer && deserializer.deserializer) loadedState = deserializer.deserializer(loadedState)
        state.set(loadedState)
        state.subscribe(value => setStateToDB<any>(key, deserializer?.serializer ? deserializer.serializer(value) : value))
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
    state.subscribe(value => sessionStorage.setItem(key, serializer(value)))
    return state
}
