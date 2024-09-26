import { derived, get, writable, type Writable } from "svelte/store"
import * as wasm from "warp-wasm"
import { WarpStore } from "./WarpStore"
import { WarpError, handleErrors } from "./HandleWarpErrors"
import { failure, success, type Result } from "$lib/utils/Result"
import type { FileInfo } from "$lib/types"
import { log } from "$lib/utils/Logger"
import prettyBytes from "pretty-bytes"

/**
 * A class that provides various methods to interact with a ConstellationBox.
 */
class ConstellationStore {
    private constellationWritable: Writable<wasm.ConstellationBox | null>
    public freeStorageSpace: Writable<string> = writable("Loading...")
    public MAX_FILE_SIZE = 104857600
    public MAX_STORAGE_SIZE = 2 * 1024 * 1024 * 1024

    private loaded = false

    /**
     * Creates an instance of ConstellationStore.
     * @param constellation - A writable store containing a ConstellationBox or null.
     */
    constructor(constellation: Writable<wasm.ConstellationBox | null>) {
        this.constellationWritable = constellation
    }

    /**
     * Check if ConstellationStore is ready to be used
     * When its not ready the root directory is using a default value instead of "root"
     */
    async checkLoaded() {
        while (!this.loaded) {
            const constellation = get(this.constellationWritable)
            if (constellation) {
                try {
                    let dir = await constellation.root_directory()
                    this.loaded = dir ? dir.name() !== "un-named directory" : false
                    if (this.loaded) {
                        break
                    }
                    await new Promise(f => setTimeout(f, 100))
                } catch (e) {
                    if (!`${e}`.includes("Constellation extension is unavailable")) throw e
                    await new Promise(f => setTimeout(f, 100))
                }
            }
        }
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

    async getStorageFreeSpaceSize(): Promise<Result<WarpError, number>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let maxSize = await constellation.max_size()
                this.MAX_STORAGE_SIZE = maxSize
                let currentSize = await constellation.current_size()
                let freeSize = maxSize - currentSize
                this.freeStorageSpace.set(prettyBytes(freeSize))
                return success(freeSize)
            } catch (error) {
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
        if (total_size !== undefined && total_size > this.MAX_FILE_SIZE) {
            return failure(WarpError.FILE_SIZE_EXCEEDED)
        }
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
                await this.getStorageFreeSpaceSize()
                return success(undefined)
            } catch (error) {
                log.error("Error uploading files from stream: " + error)
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * moves item/s from constellation.
     */
    async dropIntoFolder(fileName: string, toFolderName: string) {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let currentDir = await constellation.current_directory()
                currentDir.move_item_to(fileName, toFolderName)
                return success(undefined)
            } catch (error) {
                log.error(`Error moving item ${fileName} to directory ${toFolderName}: ` + error)
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
                let files = (await constellation.current_directory()).get_items()
                return success(files)
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
                await this.getStorageFreeSpaceSize()
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
                let currentPath = (await constellation.current_directory()).path()
                await constellation.set_path(`${currentPath}/${directory_name}`)
                return success(undefined)
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    async canGoBack(): Promise<Result<WarpError, boolean>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let currentPath = (await constellation.current_directory()).path()
                let root = (await constellation.root_directory()).path()
                return success(root !== currentPath)
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
    async goBack(): Promise<Result<WarpError, string>> {
        const constellation = get(this.constellationWritable)
        if (constellation) {
            try {
                let currentPath = (await constellation.current_directory()).path()
                let root = (await constellation.root_directory()).path()
                if (root === currentPath) {
                    log.error("Already at root. Cannot go back more")
                    return failure(WarpError.GENERAL_ERROR)
                }
                if (this.oneDepth(currentPath)) {
                    await constellation.set_path("")
                } else {
                    await constellation.go_back()
                }
                return success((await constellation.current_directory()).id())
            } catch (error) {
                return failure(handleErrors(error))
            }
        }
        return failure(WarpError.CONSTELLATION_NOT_FOUND)
    }

    /**
     * Checks if the given path is one directory deep. E.g. /foo/
     * @param path - The path to be checked.
     */
    private oneDepth(path: string): boolean {
        const regex = /^\/[A-z0-9.-_~!$&'()*+,;=:@]+\/$/
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
