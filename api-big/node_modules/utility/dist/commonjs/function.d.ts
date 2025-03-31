/**
 * A empty function.
 */
export declare function noop(..._args: any[]): any;
/**
 * Get a function parameter's names.
 *
 * @param {Function} func any function
 * @param {Boolean} [cache] default is true
 * @return {Array} names
 */
export declare function getParamNames(func: (...args: any[]) => any, cache?: boolean): string[];
