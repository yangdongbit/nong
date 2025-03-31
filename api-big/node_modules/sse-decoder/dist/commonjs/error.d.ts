/// <reference types="node" />
export declare class APIError extends Error {
    readonly status: number | undefined;
    readonly headers: Headers | undefined;
    readonly error: object | undefined;
    readonly code: string | null | undefined;
    readonly param: string | null | undefined;
    readonly type: string | undefined;
    constructor(status: number | undefined, error: object | undefined, message: string | undefined, headers: Headers | undefined);
    private static makeMessage;
}
