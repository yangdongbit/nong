export declare function randomString(length?: number, charSet?: string): string;
/**
 * split string to array
 * @param  {String} str input string
 * @param  {String} [sep] default is ','
 */
export declare function split(str?: string, sep?: string): string[];
export declare const splitAlwaysOptimized: typeof split;
type StringReplacer = (substring: string, ...args: any[]) => string;
/**
 * Replace string
 */
export declare function replace(str: string, substr: string | RegExp, newSubstr: string | StringReplacer): string;
type Replacement = (char: string) => string;
/**
 * Replace invalid http header characters with replacement
 *
 * @param {String} val input value
 * @param {String|Function} replacement - can be `function(char)`
 */
export declare function replaceInvalidHttpHeaderChar(val: string, replacement?: string | Replacement): {
    val: string;
    invalid: boolean;
};
/**
 * Detect invalid http header characters in a string
 */
export declare function includesInvalidHttpHeaderChar(val: string): boolean;
export {};
