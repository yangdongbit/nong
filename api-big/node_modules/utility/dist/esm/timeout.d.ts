export declare class TimeoutError extends Error {
    timeout: number;
    constructor(timeout: number);
}
export declare function promiseTimeout<T>(promiseArg: Promise<T>, timeout: number): Promise<T>;
export declare function runWithTimeout<T>(scope: () => Promise<T>, timeout: number): Promise<T>;
