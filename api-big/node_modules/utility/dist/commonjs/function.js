"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = noop;
exports.getParamNames = getParamNames;
const node_assert_1 = __importDefault(require("node:assert"));
/**
 * A empty function.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noop(..._args) {
    // noop
}
/**
 * Get a function parameter's names.
 *
 * @param {Function} func any function
 * @param {Boolean} [cache] default is true
 * @return {Array} names
 */
function getParamNames(func, cache) {
    const type = typeof func;
    node_assert_1.default.equal(type, 'function', `The "func" must be a function. Received type "${type}"`);
    cache = cache !== false;
    if (cache && '__cache_names' in func) {
        return func.__cache_names;
    }
    const str = func.toString();
    const names = str.slice(str.indexOf('(') + 1, str.indexOf(')')).match(/([^\s,]+)/g) || [];
    Reflect.set(func, '__cache_names', names);
    return names;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFNQSxvQkFFQztBQVNELHNDQVlDO0FBN0JELDhEQUFpQztBQUVqQzs7R0FFRztBQUNILDZEQUE2RDtBQUM3RCxTQUFnQixJQUFJLENBQUMsR0FBRyxLQUFZO0lBQ2xDLE9BQU87QUFDVCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLElBQTZCLEVBQUUsS0FBZTtJQUMxRSxNQUFNLElBQUksR0FBRyxPQUFPLElBQUksQ0FBQztJQUN6QixxQkFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGlEQUFpRCxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBRXpGLEtBQUssR0FBRyxLQUFLLEtBQUssS0FBSyxDQUFDO0lBQ3hCLElBQUksS0FBSyxJQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNyQyxPQUFPLElBQUksQ0FBQyxhQUF5QixDQUFDO0lBQ3hDLENBQUM7SUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIn0=