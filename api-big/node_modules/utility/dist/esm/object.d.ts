/**
 * High performance assign before node6
 * @param {Object} target - target object
 * @param {Object | Array} objects - object assign from
 * @return {Object} - return target object
 */
export declare function assign(target: any, objects: any | any[]): any;
export declare function has(obj: object, prop: string): boolean;
/**
 * Get all enumerable and ownership of property names
 * @param {Object} obj - detect object
 * @param {Boolean} [ignoreNull] - ignore null, undefined or NaN property
 * @return {Array<String>} property names
 */
export declare function getOwnEnumerables(obj: any, ignoreNull?: boolean): Array<string>;
/**
 * generate a real map object(clean object), no constructor, no __proto__
 * @param {Object} [obj] - init object, optional
 */
export declare function map(obj?: any): Record<string, any>;
