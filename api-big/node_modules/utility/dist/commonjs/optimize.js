"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNSTABLE_METHOD = void 0;
exports.tryCatch = tryCatch;
exports.dig = dig;
exports.argumentsToArray = argumentsToArray;
/**
 * optimize try catch
 */
function tryCatch(fn) {
    const res = {
        error: undefined,
        value: undefined,
    };
    try {
        res.value = fn();
    }
    catch (err) {
        res.error = err instanceof Error
            ? err
            : new Error(err);
    }
    return res;
}
/**
 * @description Deal with typescript
 */
exports.UNSTABLE_METHOD = {
    try: tryCatch,
};
/**
 * avoid if (a && a.b && a.b.c)
 */
function dig(obj, ...keys) {
    if (!obj) {
        return;
    }
    if (keys.length === 0) {
        return obj;
    }
    let value = obj[keys[0]];
    for (let i = 1; i < keys.length; i++) {
        if (!value) {
            break;
        }
        value = value[keys[i]];
    }
    return value;
}
/**
 * optimize arguments to array
 */
function argumentsToArray(args) {
    const res = new Array(args.length);
    for (let i = 0; i < args.length; i++) {
        res[i] = args[i];
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW1pemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3B0aW1pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsNEJBa0JDO0FBWUQsa0JBaUJDO0FBS0QsNENBTUM7QUE3REQ7O0dBRUc7QUFDSCxTQUFnQixRQUFRLENBQVUsRUFBVztJQUMzQyxNQUFNLEdBQUcsR0FHTDtRQUNGLEtBQUssRUFBRSxTQUFTO1FBQ2hCLEtBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUM7SUFFRixJQUFJLENBQUM7UUFDSCxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLFlBQVksS0FBSztZQUM5QixDQUFDLENBQUMsR0FBRztZQUNMLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFhLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQ7O0dBRUc7QUFDVSxRQUFBLGVBQWUsR0FBRztJQUM3QixHQUFHLEVBQUUsUUFBUTtDQUNkLENBQUM7QUFFRjs7R0FFRztBQUNILFNBQWdCLEdBQUcsQ0FBQyxHQUFTLEVBQUUsR0FBRyxJQUFjO0lBQzlDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNULE9BQU87SUFDVCxDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3RCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLE1BQU07UUFDUixDQUFDO1FBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFXO0lBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9