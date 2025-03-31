import assert from 'node:assert';
/**
 * A empty function.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function noop(..._args) {
    // noop
}
/**
 * Get a function parameter's names.
 *
 * @param {Function} func any function
 * @param {Boolean} [cache] default is true
 * @return {Array} names
 */
export function getParamNames(func, cache) {
    const type = typeof func;
    assert.equal(type, 'function', `The "func" must be a function. Received type "${type}"`);
    cache = cache !== false;
    if (cache && '__cache_names' in func) {
        return func.__cache_names;
    }
    const str = func.toString();
    const names = str.slice(str.indexOf('(') + 1, str.indexOf(')')).match(/([^\s,]+)/g) || [];
    Reflect.set(func, '__cache_names', names);
    return names;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sYUFBYSxDQUFDO0FBRWpDOztHQUVHO0FBQ0gsNkRBQTZEO0FBQzdELE1BQU0sVUFBVSxJQUFJLENBQUMsR0FBRyxLQUFZO0lBQ2xDLE9BQU87QUFDVCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FBQyxJQUE2QixFQUFFLEtBQWU7SUFDMUUsTUFBTSxJQUFJLEdBQUcsT0FBTyxJQUFJLENBQUM7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGlEQUFpRCxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBRXpGLEtBQUssR0FBRyxLQUFLLEtBQUssS0FBSyxDQUFDO0lBQ3hCLElBQUksS0FBSyxJQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNyQyxPQUFPLElBQUksQ0FBQyxhQUF5QixDQUFDO0lBQ3hDLENBQUM7SUFDRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIn0=