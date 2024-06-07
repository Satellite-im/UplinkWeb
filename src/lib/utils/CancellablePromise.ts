export type Cancellable = {
    cancel(): void
}

export function create_cancellable_handler(handler: () => Promise<any>): Cancellable {
    const state = { cancel: (_: any) => {} }
    Promise.race([
        new Promise((_, reject) => {
            state.cancel = reject
        }),
        handler(),
    ])
    return {
        cancel: () => {
            state.cancel("Cancelled")
        },
    }
}
