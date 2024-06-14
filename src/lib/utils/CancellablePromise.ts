export type Cancellable = {
    cancel(): void
}

/**
 * Creates a Promise that can be cancelled at anytime
 * @param handler The underlying promise to run
 * @param asReject If true will throw a rejection upon cancelling. Else it will silently resolve
 */
export function create_cancellable_handler(handler: () => Promise<any>, asReject?: boolean): Cancellable {
    const state = { cancel: (_: any) => {} }
    Promise.race([
        new Promise((resolve, reject) => {
            state.cancel = reason => {
                if (asReject) reject(reason)
                else resolve(undefined)
            }
        }),
        handler(),
    ])
    return {
        cancel: () => {
            state.cancel("Canceled")
        },
    }
}
