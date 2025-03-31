// http://www.2ality.com/2013/10/safe-integers.html
// http://es6.ruanyifeng.com/#docs/number
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
export const MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER;
export const MAX_SAFE_INTEGER_STR = String(MAX_SAFE_INTEGER);
const MAX_SAFE_INTEGER_STR_LENGTH = MAX_SAFE_INTEGER_STR.length;
/**
 * Detect a number string can safe convert to Javascript Number.
 *
 * @param {String} s number format string, like `"123"`, `"-1000123123123123123123"`
 */
export function isSafeNumberString(s) {
    if (s[0] === '-') {
        s = s.substring(1);
    }
    if (s.length < MAX_SAFE_INTEGER_STR_LENGTH ||
        (s.length === MAX_SAFE_INTEGER_STR_LENGTH && s <= MAX_SAFE_INTEGER_STR)) {
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
export function toSafeNumber(s) {
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
export function random(lower, upper) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL251bWJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtREFBbUQ7QUFDbkQseUNBQXlDO0FBQ3pDLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0UsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNsRCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3RCxNQUFNLDJCQUEyQixHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztBQUVoRTs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLENBQVM7SUFDMUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRywyQkFBMkI7UUFDeEMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLDJCQUEyQixJQUFJLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7UUFDMUUsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLENBQWtCO0lBQzdDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQUMsS0FBYyxFQUFFLEtBQWM7SUFDbkQsV0FBVztJQUNYLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELG9DQUFvQztJQUNwQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN4QixLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2QsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNaLENBQUM7SUFDRCxJQUFJLElBQVksQ0FBQztJQUNqQix1QkFBdUI7SUFDdkIsSUFBSSxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDbEIsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUNiLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDZCxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQyJ9