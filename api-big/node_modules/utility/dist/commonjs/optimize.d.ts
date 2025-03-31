/**
 * optimize try catch
 */
export declare function tryCatch<T = any>(fn: () => T): {
    error: Error | undefined;
    value: T | undefined;
};
/**
 * @description Deal with typescript
 */
export declare const UNSTABLE_METHOD: {
    try: typeof tryCatch;
};
/**
 * avoid if (a && a.b && a.b.c)
 */
export declare function dig(obj?: any, ...keys: string[]): any;
/**
 * optimize arguments to array
 */
export declare function argumentsToArray(args: any[]): any[];
