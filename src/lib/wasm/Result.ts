export type Result<E, T> = {
    fold<R>(
        onFailure: (failure: E) => R,
        onSuccess: (value: T) => R
    ): R;
};

class Success<E, T> implements Result<E, T> {
    constructor(private value: T) {}

    fold<R>(
        _: (failure: E) => R,
        onSuccess: (value: T) => R
    ): R {
        return onSuccess(this.value);
    }
}

class Failure<E, T> implements Result<E, T> {
    constructor(private failure: E) {}

    fold<R>(
        onFailure: (failure: E) => R,
        _: (value: T) => R
    ): R {
        return onFailure(this.failure);
    }
}

export function success<E, T>(value: T): Result<E, T> {
    return new Success(value);
}

export function failure<E, T>(failure: E): Result<E, T> {
    return new Failure(failure);
}
