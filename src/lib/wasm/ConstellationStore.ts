import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { ULog } from "../../ulog"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import { Store } from "$lib/state/store"

class ConstellationStore {
    private constellationWritable: Writable<wasm.ConstellationBox | null>

    constructor(constellation: Writable<wasm.ConstellationBox | null>) {
        this.constellationWritable = constellation
    }

    async createDirectory(directory_name: string): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                return success(await constellation.create_directory(directory_name, true))
            } catch (error) {
                get(Store.state.logger).error('Error creating new directory: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }
}

export const ConstellationStoreInstance = new ConstellationStore(WarpStore.warp.constellation);
