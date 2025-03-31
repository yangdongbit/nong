"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
exports.promiseTimeout = promiseTimeout;
exports.runWithTimeout = runWithTimeout;
class TimeoutError extends Error {
    timeout;
    constructor(timeout) {
        super(`Timed out after ${timeout}ms`);
        this.name = this.constructor.name;
        this.timeout = timeout;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.TimeoutError = TimeoutError;
// https://betterstack.com/community/guides/scaling-nodejs/nodejs-timeouts/
async function promiseTimeout(promiseArg, timeout) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
            reject(new TimeoutError(timeout));
        }, timeout);
    });
    try {
        return await Promise.race([promiseArg, timeoutPromise]);
    }
    finally {
        clearTimeout(timer);
    }
}
async function runWithTimeout(scope, timeout) {
    return await promiseTimeout(scope(), timeout);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aW1lb3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVlBLHdDQWdCQztBQUVELHdDQUtDO0FBbkNELE1BQWEsWUFBYSxTQUFRLEtBQUs7SUFDckMsT0FBTyxDQUFTO0lBRWhCLFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMsbUJBQW1CLE9BQU8sSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRCxDQUFDO0NBQ0Y7QUFURCxvQ0FTQztBQUVELDJFQUEyRTtBQUNwRSxLQUFLLFVBQVUsY0FBYyxDQUNsQyxVQUFzQixFQUN0QixPQUFlO0lBRWYsSUFBSSxLQUFxQixDQUFDO0lBQzFCLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RELEtBQUssR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDO1FBQ0gsT0FBTyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBRSxVQUFVLEVBQUUsY0FBYyxDQUFFLENBQUMsQ0FBQztJQUM1RCxDQUFDO1lBQVMsQ0FBQztRQUNULFlBQVksQ0FBQyxLQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDO0FBQ0gsQ0FBQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQ2xDLEtBQXVCLEVBQ3ZCLE9BQWU7SUFFZixPQUFPLE1BQU0sY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELENBQUMifQ==