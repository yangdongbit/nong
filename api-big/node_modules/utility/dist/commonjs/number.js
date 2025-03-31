"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_SAFE_INTEGER_STR = exports.MIN_SAFE_INTEGER = exports.MAX_SAFE_INTEGER = void 0;
exports.isSafeNumberString = isSafeNumberString;
exports.toSafeNumber = toSafeNumber;
exports.random = random;
// http://www.2ality.com/2013/10/safe-integers.html
// http://es6.ruanyifeng.com/#docs/number
exports.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
exports.MIN_SAFE_INTEGER = -exports.MAX_SAFE_INTEGER;
exports.MAX_SAFE_INTEGER_STR = String(exports.MAX_SAFE_INTEGER);
const MAX_SAFE_INTEGER_STR_LENGTH = exports.MAX_SAFE_INTEGER_STR.length;
/**
 * Detect a number string can safe convert to Javascript Number.
 *
 * @param {String} s number format string, like `"123"`, `"-1000123123123123123123"`
 */
function isSafeNumberString(s) {
    if (s[0] === '-') {
        s = s.substring(1);
    }
    if (s.length < MAX_SAFE_INTEGER_STR_LENGTH ||
        (s.length === MAX_SAFE_INTEGER_STR_LENGTH && s <= exports.MAX_SAFE_INTEGER_STR)) {
        return true;
    }
    return false;
}
/**
 * Convert string to Number if string in safe Number scope.
 *
 * @param {String} s number format string.
 * @return {Number|String} success will return Number, otherwise return the original string.
 */
function toSafeNumber(s) {
    if (typeof s === 'number') {
        return s;
    }
    return isSafeNumberString(s) ? Number(s) : s;
}
/**
 * Produces a random integer between the inclusive `lower` and `upper` bounds.
 *
 * @param {Number} lower The lower bound.
 * @param {Number} upper The upper bound.
 * @return {Number} Returns the random number.
 */
function random(lower, upper) {
    // random()
    if (lower === undefined) {
        return 0;
    }
    // random(lower) => random(0, lower)
    if (upper === undefined) {
        upper = lower;
        lower = 0;
    }
    let temp;
    // random(upper, lower)
    if (lower > upper) {
        temp = lower;
        lower = upper;
        upper = temp;
    }
    return Math.floor(lower + Math.random() * (upper - lower));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL251bWJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFZQSxnREFTQztBQVFELG9DQU1DO0FBU0Qsd0JBa0JDO0FBOURELG1EQUFtRDtBQUNuRCx5Q0FBeUM7QUFDNUIsUUFBQSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xFLFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyx3QkFBZ0IsQ0FBQztBQUNyQyxRQUFBLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyx3QkFBZ0IsQ0FBQyxDQUFDO0FBQzdELE1BQU0sMkJBQTJCLEdBQUcsNEJBQW9CLENBQUMsTUFBTSxDQUFDO0FBRWhFOzs7O0dBSUc7QUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxDQUFTO0lBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsMkJBQTJCO1FBQ3hDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSywyQkFBMkIsSUFBSSxDQUFDLElBQUksNEJBQW9CLENBQUMsRUFBRSxDQUFDO1FBQzFFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLENBQWtCO0lBQzdDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxLQUFjLEVBQUUsS0FBYztJQUNuRCxXQUFXO0lBQ1gsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDeEIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0Qsb0NBQW9DO0lBQ3BDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3hCLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDZCxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUNELElBQUksSUFBWSxDQUFDO0lBQ2pCLHVCQUF1QjtJQUN2QixJQUFJLEtBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQztRQUNsQixJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2IsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNkLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDZixDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDIn0=