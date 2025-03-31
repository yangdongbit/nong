export declare const MAX_SAFE_INTEGER: number;
export declare const MIN_SAFE_INTEGER: number;
export declare const MAX_SAFE_INTEGER_STR: string;
/**
 * Detect a number string can safe convert to Javascript Number.
 *
 * @param {String} s number format string, like `"123"`, `"-1000123123123123123123"`
 */
export declare function isSafeNumberString(s: string): boolean;
/**
 * Convert string to Number if string in safe Number scope.
 *
 * @param {String} s number format string.
 * @return {Number|String} success will return Number, otherwise return the original string.
 */
export declare function toSafeNumber(s: string | number): number | string;
/**
 * Produces a random integer between the inclusive `lower` and `upper` bounds.
 *
 * @param {Number} lower The lower bound.
 * @param {Number} upper The upper bound.
 * @return {Number} Returns the random number.
 */
export declare function random(lower?: number, upper?: number): number;
