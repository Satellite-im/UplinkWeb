export type Result<E, T> = 
    | { kind: 'failure'; failure: E }
    | { kind: 'success'; value: T };

export function success<E, T>(value: T): Result<E, T> {
    return { kind: 'success', value };
}

export function failure<E, T>(failure: E): Result<E, T> {
    return { kind: 'failure', failure };
}

export function fold<E, T, R>(
    result: Result<E, T>,
    onFailure: (failure: E) => R,
    onSuccess: (value: T) => R
): R {
    if (result.kind === 'success') {
        return onSuccess(result.value);
    } else {
        return onFailure(result.failure);
    }
}
