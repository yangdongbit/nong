"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = assign;
exports.has = has;
exports.getOwnEnumerables = getOwnEnumerables;
exports.map = map;
/**
 * High performance assign before node6
 * @param {Object} target - target object
 * @param {Object | Array} objects - object assign from
 * @return {Object} - return target object
 */
function assign(target, objects) {
    if (!Array.isArray(objects)) {
        objects = [objects];
    }
    for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        if (obj) {
            const keys = Object.keys(obj);
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                target[key] = obj[key];
            }
        }
    }
    return target;
}
function has(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
/**
 * Get all enumerable and ownership of property names
 * @param {Object} obj - detect object
 * @param {Boolean} [ignoreNull] - ignore null, undefined or NaN property
 * @return {Array<String>} property names
 */
function getOwnEnumerables(obj, ignoreNull) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return [];
    }
    return Object.keys(obj).filter(function (key) {
        if (ignoreNull) {
            const value = obj[key];
            if (value === null || value === undefined || Number.isNaN(value)) {
                return false;
            }
        }
        return has(obj, key);
    });
}
// faster way like `Object.create(null)` to get a 'clean' empty object
// https://github.com/nodejs/node/blob/master/lib/events.js#L5
// https://cnodejs.org/topic/571e0c445a26c4a841ecbcf1
function EmptyObject() { }
EmptyObject.prototype = Object.create(null);
/**
 * generate a real map object(clean object), no constructor, no __proto__
 * @param {Object} [obj] - init object, optional
 */
function map(obj) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newObj = new EmptyObject();
    if (!obj) {
        return newObj;
    }
    for (const key in obj) {
        newObj[key] = obj[key];
    }
    return newObj;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29iamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLHdCQWdCQztBQUVELGtCQUVDO0FBUUQsOENBYUM7QUFZRCxrQkFZQztBQXZFRDs7Ozs7R0FLRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxNQUFXLEVBQUUsT0FBb0I7SUFDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUM1QixPQUFPLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN4QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNSLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFnQixHQUFHLENBQUMsR0FBVyxFQUFFLElBQVk7SUFDM0MsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWdCLGlCQUFpQixDQUFDLEdBQVEsRUFBRSxVQUFvQjtJQUM5RCxJQUFJLENBQUMsR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDMUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFTLEdBQUc7UUFDekMsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNmLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ2pFLE9BQU8sS0FBSyxDQUFDO1lBQ2YsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsc0VBQXNFO0FBQ3RFLDhEQUE4RDtBQUM5RCxxREFBcUQ7QUFDckQsU0FBUyxXQUFXLEtBQUksQ0FBQztBQUN6QixXQUFXLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFNUM7OztHQUdHO0FBQ0gsU0FBZ0IsR0FBRyxDQUFDLEdBQVM7SUFDM0IsNkRBQTZEO0lBQzdELGFBQWE7SUFDYixNQUFNLE1BQU0sR0FBRyxJQUFJLFdBQVcsRUFBeUIsQ0FBQztJQUN4RCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDVCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIn0=