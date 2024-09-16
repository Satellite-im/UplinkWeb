export type Cancellable = {
    cancel(): void
}

/**
 * Creates a Promise that can be cancelled at any time
 * @param handler The underlying promise to run
 * @param asReject If true will throw a rejection upon cancelling. Else it will silently resolve
 */
export function create_cancellable_handler(handler: (isCancelled: () => boolean) => Promise<any>, asReject?: boolean): Cancellable {
    let isCancelled = false

    const state = { cancel: (_: any) => {} }

    const promise = new Promise((resolve, reject) => {
        state.cancel = reason => {
            isCancelled = true
            if (asReject) reject(reason)
            else resolve(undefined)
        }
    })

    Promise.race([promise, handler(() => isCancelled)])

    return {
        cancel: () => {
            state.cancel("Canceled")
        },
    }
}
