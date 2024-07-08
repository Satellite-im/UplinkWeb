import { get, writable, type Writable } from "svelte/store"
import init, * as wasm from "warp-wasm"

export interface IWarp {
    tesseract: Writable<wasm.Tesseract | null>
    multipass: Writable<wasm.MultiPassBox | null>
    raygun: Writable<wasm.RayGunBox | null>
    constellation: Writable<wasm.ConstellationBox | null>
}

const inititialized: Writable<boolean> = writable(false)

export async function initWarp() {
    if (!get(inititialized)) {
        await init()
        inititialized.set(true)
    }
}
