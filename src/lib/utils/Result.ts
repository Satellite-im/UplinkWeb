export type Result<E, T> = {
    fold<R>(onFailure: (failure: E) => R, onSuccess: (value: T) => R): R
    onSuccess(callback: (value: T) => void): void
    onFailure(callback: (failure: E) => void): void
}

class Success<E, T> implements Result<E, T> {
    constructor(private value: T) {}

    fold<R>(_: (failure: E) => R, onSuccess: (value: T) => R): R {
        return onSuccess(this.value)
    }

    onSuccess(callback: (value: T) => void): void {
        callback(this.value)
    }

    onFailure(_: (failure: E) => void): void {
        // do nothing
    }
}

class Failure<E, T> implements Result<E, T> {
    constructor(private failure: E) {}

    fold<R>(onFailure: (failure: E) => R, _: (value: T) => R): R {
        return onFailure(this.failure)
    }

    onSuccess(_: (value: T) => void): void {
        // do nothing
    }

    onFailure(callback: (failure: E) => void): void {
        callback(this.failure)
    }
}

export function success<E, T>(value: T): Result<E, T> {
    return new Success(value)
}

export function failure<E, T>(failure: E): Result<E, T> {
    return new Failure(failure)
}
