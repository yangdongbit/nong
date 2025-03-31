/**
 * Escape the given string of `html`.
 *
 * @param {String} html the html need to escape
 * @return {String} escape html
 * @public
 */
export declare function escape(html: string): string;
/**
 * Unescape the given string from html
 * @public
 */
export declare function unescape(html: string, type?: string): string;
/**
 * Safe encodeURIComponent, won't throw any error.
 * If `encodeURIComponent` error happen, just return the original value.
 *
 * @param {String} text input text
 * @return {String} URL encode string.
 */
export declare function encodeURIComponent(text: string): string;
/**
 * Safe decodeURIComponent, won't throw any error.
 * If `decodeURIComponent` error happen, just return the original value.
 *
 * @param {String} encodeText encode text
 * @return {String} URL decode original string.
 */
export declare function decodeURIComponent(encodeText: string): string;
