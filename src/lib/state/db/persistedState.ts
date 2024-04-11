import { writable } from 'svelte/store'
import { getStateFromDB, setStateToDB } from './dbOperations'

export function createPersistentState<T>(key: string, defaultState: T) {
    const state = writable<T>(defaultState)
    getStateFromDB<T>(key, defaultState).then((loadedState) => {
        state.set(loadedState)
        state.subscribe((value) => setStateToDB<T>(key, value))
    })
    return state
}