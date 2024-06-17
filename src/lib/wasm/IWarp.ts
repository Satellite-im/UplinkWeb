import type { Writable } from "svelte/store"
import * as wasm from "warp-wasm"

export interface IWarp {
    tesseract: Writable<wasm.Tesseract | null>
    multipass: Writable<wasm.MultiPassBox | null>
    raygun: Writable<wasm.RayGunBox | null>
    constellation: Writable<wasm.ConstellationBox | null>
}
