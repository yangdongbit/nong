/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { ReadableStream } from 'node:stream/web';
type Bytes = string | ArrayBuffer | Uint8Array | Buffer | null | undefined;
export declare class SSEDecoder {
    private data;
    private event;
    private chunks;
    constructor();
    decode(line: string): ServerSentEvent | null;
}
/**
 * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
 * reading lines from text.
 *
 * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
 */
export declare class LineDecoder {
    static NEWLINE_CHARS: Set<string>;
    static NEWLINE_REGEXP: RegExp;
    buffer: string[];
    trailingCR: boolean;
    textDecoder: any;
    constructor();
    decode(chunk: Bytes): string[];
    decodeText(bytes: Bytes): string;
    flush(): string[];
}
export type ServerSentEvent = {
    event: string | null;
    data: string;
    raw: string[];
};
/** This is an internal helper function that's just used for testing */
export declare function _decodeChunks(chunks: string[]): string[];
/**
 * Most browsers don't yet have async iterable support for ReadableStream,
 * and Node has a very different way of reading bytes from its "ReadableStream".
 *
 * This polyfill was pulled from https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
 */
export declare function readableStreamAsyncIterable<T>(stream: any): AsyncIterableIterator<T>;
export declare class Stream<Item> implements AsyncIterable<Item> {
    private iterator;
    controller?: AbortController;
    constructor(iterator: () => AsyncIterator<Item>, controller?: AbortController);
    static fromSSEResponse<Item>(response: Response, controller: AbortController): Stream<Item>;
    /**
     * Generates a Stream from a newline-separated ReadableStream
     * where each item is a JSON value.
     */
    static fromReadableStream<Item>(readableStream: ReadableStream, controller?: AbortController, options?: {
        disableJSONParse?: boolean;
    }): Stream<Item>;
    [Symbol.asyncIterator](): AsyncIterator<Item>;
    /**
     * Splits the stream into two streams which can be
     * independently read from at different speeds.
     */
    tee(): [Stream<Item>, Stream<Item>];
    /**
     * Converts this stream to a newline-separated ReadableStream of
     * JSON stringified values in the stream
     * which can be turned back into a Stream with `Stream.fromReadableStream()`.
     */
    toReadableStream(): ReadableStream;
}
export {};
