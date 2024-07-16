import { get, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import type { FileInfo } from "$lib/types"
import { log } from "$lib/utils/Logger"
import { func } from "three/examples/jsm/nodes/Nodes.js"

/**
 * A class that provides various methods to interact with a ConstellationBox.
 */
class ConstellationStore {
    private constellationWritable: Writable<wasm.ConstellationBox | null>

    /**
     * Creates an instance of ConstellationStore.
     * @param constellation - A writable store containing a ConstellationBox or null.
     */
    constructor(constellation: Writable<wasm.ConstellationBox | null>) {
        this.constellationWritable = constellation
    }

    /**
     * Creates a new directory within the constellation.
     * @param directory_name - The name of the new directory.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async createDirectory(directory_name: string): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                log.info("Creating new directory: " + directory_name)
                await constellation.create_directory(directory_name, false)
                return success(undefined)
            } catch (error) {
                log.error("Error creating new directory: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Uploads files from a stream to the constellation.
     * @param file_name - The name of the file to be uploaded.
     * @param stream - The stream of data to be uploaded.
     * @param total_size - The total size of the file, if known.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async uploadFilesFromStream(file_name: string, stream: ReadableStream<any>, total_size: number | undefined): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let async_iterator = await constellation.put_stream(file_name, total_size, stream)
                let put_stream_status = {
                    [Symbol.asyncIterator]() {
                        return async_iterator
                    },
                }
                for await (const value of put_stream_status) {
                    if (value.ProgressComplete != null) {
                        log.info(value)
                        break
                    }
                }
                return success(undefined)
            } catch (error) {
                log.error("Error uploading files from stream: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Retrieves the files in the current directory.
     * @returns A Result containing either the list of files or a WarpError.
     */
    async getCurrentDirectoryFiles(): Promise<Result<WarpError, wasm.Item[]>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let files = constellation.current_directory().get_items()
                return success(files)
            } catch (error) {
                log.error("Error getting current directory files: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * moves item/s from constellation.
     * @returns A Result containing either the list of files or a WarpError.
     */
    async dropIntoFolder(fileName: string, toFolderName: string): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        let currentDir = constellation!.current_directory()
        if (constellation) {
            try {
                currentDir.move_item_to(fileName, toFolderName)
                return success(undefined)
            } catch (error) {
                log.error("Error getting current directory files: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Deletes an item from the constellation.
     * @param file_name - The name of the item to be deleted.
     * @returns A Result containing either success or failure with a WarpError.
     */
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

    /**
     * Renames an item in the constellation.
     * @param old_name - The current name of the item.
     * @param new_name - The new name for the item.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async renameItem(old_name: string, new_name: string): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                await constellation.rename(old_name, new_name)
                return success(undefined)
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Sets the order of items in the current directory.
     * @param currentFiles - An array of FileInfo objects representing the new order of items.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async setItemsOrders(currentFiles: FileInfo[]): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let currentDir = await constellation.current_directory()
                let dirItems = currentDir.get_items()
                const idToItemMap = new Map<string, wasm.Item>()
                dirItems.forEach(item => idToItemMap.set(item.id(), item))
                const reorderedItems = currentFiles.map(fileInfo => idToItemMap.get(fileInfo.id)).filter(item => item !== undefined) as wasm.Item[]
                currentDir.set_items(reorderedItems)
                return success(undefined)
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Opens a directory within the constellation.
     * @param directory_name - The name of the directory to be opened.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async openDirectory(directory_name: string): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let currentPath = constellation.current_directory().path()
                await constellation.set_path(`${currentPath}/${directory_name}`)
                return success(undefined)
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Goes back to the previous directory in the constellation.
     * @returns A Result containing either success or failure with a WarpError.
     */
    async goBack(): Promise<Result<WarpError, void>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let currentPath = constellation.current_directory().path()
                if (this.isValidFormat(currentPath)) {
                    await constellation.set_path("")
                } else {
                    await constellation.go_back()
                }
                return success(undefined)
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Checks if the given path is in a valid format.
     * @param path - The path to be validated.
     * @returns A boolean indicating whether the path is in a valid format.
     */
    private isValidFormat(path: string): boolean {
        const regex = /^\/[a-zA-Z0-9]+\/$/
        return regex.test(path)
    }

    async downloadFile(fileName: string): Promise<Result<WarpError, Blob>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let get_stream_async_iterator = await constellation.get_stream(fileName)
                let get_stream = {
                    [Symbol.asyncIterator]() {
                        return get_stream_async_iterator
                    },
                }

                const chunks = []
                try {
                    for await (const value of get_stream) {
                        if (value.Ok != null) {
                            chunks.push(Buffer.from(value.Ok))
                        }
                    }
                } finally {
                    const combinedArray = Buffer.concat(chunks)
                    const blob = new Blob([new Uint8Array(combinedArray)], { type: "application/octet-stream" })
                    return success(blob)
                }
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }
}

export function imageFromData(data: any[], prefix: string, kind: string) {
    let hrefData = btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ""))
    return `data:${prefix}/${kind};base64, ${hrefData}`
}

export const ConstellationStoreInstance = new ConstellationStore(WarpStore.warp.constellation)
