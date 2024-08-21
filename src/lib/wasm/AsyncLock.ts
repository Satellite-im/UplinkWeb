/**
 * An AsyncLock that only allows one call at a time to the underlying value
 */
class AsyncLock<T extends object> {
    private val: T

    private locked = false
    private queue: ((v: void) => void)[] = []

    constructor(v: T) {
        this.val = v
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
                        return target.apply(v => {
                            return (v as any)[prop].apply(v, args)
                        })
                    }
                }
                return undefined
            },
        })
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

    private async apply<V>(f: (t: T) => V): Promise<V> {
        await this.lock()
        try {
            return await f(this.val)
        } finally {
            this.unlock()
        }
    }

    /**
     * Create a child lock that requires its parents lock to execute its things
     */
    subLock<V extends object>(f: (t: T) => V): AsyncLock<V> & V {
        let subLock = new AsyncLock<V>(f(this.val))
        subLock.lock = this.lock
        subLock.unlock = this.unlock
        return subLock as AsyncLock<V> & V
    }
}

/**
 * Create a new Lock for the given value
 * All access to the underlying value will be delegated behind a lock
 * Field access are returned without a lock
 * Note that all functions (non async too) will return a Promise!
 */
export function createLock<T extends object>(v: T) {
    return new AsyncLock(v) as AsyncLock<T> & T
}
