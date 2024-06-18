export type RustEnum = {
    // The type to identify the enum (In most cases the original enums name)
    type: string
    // The values in the original rust enum
    values: { [key: string]: any }
}

/**
 * Parses a JSValue into an type similar to rust type enums
 * @param value The JSValue that was originally a rust type enum
 */
export function parseJSValue(value: any): RustEnum {
    let keys = Object.keys(value)
    if (keys.length !== 1) {
        throw new Error(`Value '${value}' is not a rust enum`)
    }
    return {
        type: keys[0],
        values: value[keys[0]],
    }
}
