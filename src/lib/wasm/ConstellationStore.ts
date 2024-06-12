import { get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
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
                console.log('Creating new directory: ' + directory_name)
                await constellation.create_directory(directory_name, false)
                return success(undefined)
            } catch (error) {
                get(Store.state.logger).error('Error creating new directory: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    async uploadFilesFromStream(file_name: string, stream: ReadableStream<any>, total_size: number | undefined): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let async_iterator = await constellation.put_stream(file_name, total_size, stream)
                let put_stream_status = { [Symbol.asyncIterator]() { return async_iterator } }
                for await (const value of put_stream_status) {
                    if (value.ProgressComplete != null ) {
                        console.log(value)
                        break
                    }
                }
                return success(undefined)
            } catch (error) {
                get(Store.state.logger).error('Error creating new directory: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    async getCurrentDirectoryFiles(): Promise<Result<WarpError, wasm.Item[]>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let files =  constellation.current_directory().get_items()
                return success(files)
            } catch (error) {
                get(Store.state.logger).error('Error getting current directory files: ' + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    async deleteItem(file_name: string): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                await constellation.remove(file_name, true)
                return success(undefined)
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }
}

export const ConstellationStoreInstance = new ConstellationStore(WarpStore.warp.constellation);
