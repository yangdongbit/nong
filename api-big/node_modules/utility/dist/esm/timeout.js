export class TimeoutError extends Error {
    timeout;
    constructor(timeout) {
        super(`Timed out after ${timeout}ms`);
        this.name = this.constructor.name;
        this.timeout = timeout;
        Error.captureStackTrace(this, this.constructor);
    }
}
// https://betterstack.com/community/guides/scaling-nodejs/nodejs-timeouts/
export async function promiseTimeout(promiseArg, timeout) {
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
export async function runWithTimeout(scope, timeout) {
    return await promiseTimeout(scope(), timeout);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90aW1lb3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sT0FBTyxZQUFhLFNBQVEsS0FBSztJQUNyQyxPQUFPLENBQVM7SUFFaEIsWUFBWSxPQUFlO1FBQ3pCLEtBQUssQ0FBQyxtQkFBbUIsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FDRjtBQUVELDJFQUEyRTtBQUMzRSxNQUFNLENBQUMsS0FBSyxVQUFVLGNBQWMsQ0FDbEMsVUFBc0IsRUFDdEIsT0FBZTtJQUVmLElBQUksS0FBcUIsQ0FBQztJQUMxQixNQUFNLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBUSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN0RCxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN0QixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNwQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQztRQUNILE9BQU8sTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBRSxDQUFDLENBQUM7SUFDNUQsQ0FBQztZQUFTLENBQUM7UUFDVCxZQUFZLENBQUMsS0FBTSxDQUFDLENBQUM7SUFDdkIsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLGNBQWMsQ0FDbEMsS0FBdUIsRUFDdkIsT0FBZTtJQUVmLE9BQU8sTUFBTSxjQUFjLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEQsQ0FBQyJ9