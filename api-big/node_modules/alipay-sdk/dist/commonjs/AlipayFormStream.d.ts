import FormStream from 'formstream';
export interface AlipayFormStreamOptions {
    /** min chunk size to emit data event */
    minChunkSize?: number;
}
export declare class AlipayFormStream extends FormStream {
    constructor(options?: AlipayFormStreamOptions);
}
