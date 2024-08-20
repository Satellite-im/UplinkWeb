/**
 * An AsyncLock that only allows one call at a time to the underlying value
 */
class AsyncLock<T extends object> {
    private val: T

    private locked = false
    private queue: ((v: void) => void)[] = []
    private onlyAsync: boolean

    constructor(v: T, onlyAsync?: boolean) {
        this.val = v
        this.onlyAsync = onlyAsync ? onlyAsync : false
    }

    private async lock() {
        while (this.locked) {
            await new Promise<void>(resolve => {
                this.queue.push(resolve)
            })
        }
        this.locked = true
    }

    private unlock() {
        this.locked = false
        if (this.queue.length > 0) {
            const nextResolve = this.queue.shift()
            if (nextResolve) nextResolve()
        }
    }

    async apply<V>(f: (t: T) => V): Promise<V> {
        await this.lock()
        try {
            return await f(this.val)
        } finally {
            this.unlock()
        }
    }

    asProxy() {
        return new Proxy<AsyncLock<T>>(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop as keyof typeof target]
                }
                if (prop in target.val) {
                    let f = (target.val as any)[prop]
                    // If its a field we return it directly without locks
                    if (typeof f !== "function") return f
                    return (...args: any[]) => {
                        // If not async and we only target async return the function result directly
                        // Otherwise the non async function will be behind a lock and also be turned into a Promise
                        if (f.constructor.name !== "AsyncFunction" && target.onlyAsync) return f(args)
                        return target.apply(v => {
                            return (v as any)[prop].apply(v, args)
                        })
                    }
                }
                return undefined
            },
        })
    }
}

/**
 * Create a new Lock for the given value
 * All access to the underlying value will be delegated behind a lock
 * Field access are returned without a lock
 * @param onlyAsync If true only async function will be behind a lock.
 *                  Otherwise all functions are locked.
 *                  Note that non async function will then return a Promise
 */
export function createLock<T extends object>(v: T, onlyAsync?: boolean) {
    return new AsyncLock(v, onlyAsync).asProxy() as T
}
