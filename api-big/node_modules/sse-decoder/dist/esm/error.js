export class APIError extends Error {
    status;
    headers;
    error;
    code;
    param;
    type;
    constructor(status, error, message, headers) {
        super(`${APIError.makeMessage(status, error, message)}`);
        this.status = status;
        this.headers = headers;
        const data = error;
        this.error = data;
        this.code = data?.code;
        this.param = data?.param;
        this.type = data?.type;
    }
    static makeMessage(status, error, message) {
        const msg = error?.message
            ? typeof error.message === 'string'
                ? error.message
                : JSON.stringify(error.message)
            : error
                ? JSON.stringify(error)
                : message;
        if (status && msg) {
            return `${status} ${msg}`;
        }
        if (status) {
            return `${status} status code (no body)`;
        }
        if (msg) {
            return msg;
        }
        return '(no status code or body)';
    }
}
