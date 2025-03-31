"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.channels = exports.HEADER_USER_AGENT = exports.VERSION = exports.PROTO_RE = void 0;
const node_diagnostics_channel_1 = __importDefault(require("node:diagnostics_channel"));
const node_events_1 = require("node:events");
const node_http_1 = require("node:http");
const node_util_1 = require("node:util");
const node_zlib_1 = require("node:zlib");
const node_stream_1 = require("node:stream");
const promises_1 = require("node:stream/promises");
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const node_url_1 = require("node:url");
const node_perf_hooks_1 = require("node:perf_hooks");
const node_querystring_1 = __importDefault(require("node:querystring"));
const promises_2 = require("node:timers/promises");
const undici_1 = require("undici");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const symbols_js_1 = __importDefault(require("undici/lib/core/symbols.js"));
const mime_types_1 = __importDefault(require("mime-types"));
const qs_1 = __importDefault(require("qs"));
// Compatible with old style formstream
const formstream_1 = __importDefault(require("formstream"));
const FormData_js_1 = require("./FormData.js");
const HttpAgent_js_1 = require("./HttpAgent.js");
const utils_js_1 = require("./utils.js");
const symbols_js_2 = __importDefault(require("./symbols.js"));
const diagnosticsChannel_js_1 = require("./diagnosticsChannel.js");
const HttpClientError_js_1 = require("./HttpClientError.js");
exports.PROTO_RE = /^https?:\/\//i;
function noop() {
    // noop
}
const debug = (0, node_util_1.debuglog)('urllib:HttpClient');
exports.VERSION = '4.6.11';
// 'node-urllib/4.0.0 Node.js/18.19.0 (darwin; x64)'
exports.HEADER_USER_AGENT = `node-urllib/${exports.VERSION} Node.js/${process.version.substring(1)} (${process.platform}; ${process.arch})`;
function getFileName(stream) {
    const filePath = stream.path;
    if (filePath) {
        return (0, node_path_1.basename)(filePath);
    }
    return '';
}
function defaultIsRetry(response) {
    return response.status >= 500;
}
exports.channels = {
    request: node_diagnostics_channel_1.default.channel('urllib:request'),
    response: node_diagnostics_channel_1.default.channel('urllib:response'),
    fetchRequest: node_diagnostics_channel_1.default.channel('urllib:fetch:request'),
    fetchResponse: node_diagnostics_channel_1.default.channel('urllib:fetch:response'),
};
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
const RedirectStatusCodes = [
    301, // Moved Permanently
    302, // Found
    303, // See Other
    307, // Temporary Redirect
    308, // Permanent Redirect
];
class HttpClient extends node_events_1.EventEmitter {
    #defaultArgs;
    #dispatcher;
    constructor(clientOptions) {
        super();
        this.#defaultArgs = clientOptions?.defaultArgs;
        if (clientOptions?.lookup || clientOptions?.checkAddress) {
            this.#dispatcher = new HttpAgent_js_1.HttpAgent({
                lookup: clientOptions.lookup,
                checkAddress: clientOptions.checkAddress,
                connect: clientOptions.connect,
                allowH2: clientOptions.allowH2,
            });
        }
        else if (clientOptions?.connect) {
            this.#dispatcher = new undici_1.Agent({
                connect: clientOptions.connect,
                allowH2: clientOptions.allowH2,
            });
        }
        else if (clientOptions?.allowH2) {
            // Support HTTP2
            this.#dispatcher = new undici_1.Agent({
                allowH2: clientOptions.allowH2,
            });
        }
        (0, diagnosticsChannel_js_1.initDiagnosticsChannel)();
    }
    getDispatcher() {
        return this.#dispatcher ?? (0, undici_1.getGlobalDispatcher)();
    }
    setDispatcher(dispatcher) {
        this.#dispatcher = dispatcher;
    }
    getDispatcherPoolStats() {
        const agent = this.getDispatcher();
        // origin => Pool Instance
        const clients = Reflect.get(agent, symbols_js_1.default.kClients);
        const poolStatsMap = {};
        if (!clients) {
            return poolStatsMap;
        }
        for (const [key, ref] of clients) {
            const pool = typeof ref.deref === 'function' ? ref.deref() : ref;
            const stats = pool?.stats;
            if (!stats)
                continue;
            poolStatsMap[key] = {
                connected: stats.connected,
                free: stats.free,
                pending: stats.pending,
                queued: stats.queued,
                running: stats.running,
                size: stats.size,
            };
        }
        return poolStatsMap;
    }
    async request(url, options) {
        return await this.#requestInternal(url, options);
    }
    // alias to request, keep compatible with urllib@2 HttpClient.curl
    async curl(url, options) {
        return await this.request(url, options);
    }
    async #requestInternal(url, options, requestContext) {
        const requestId = (0, utils_js_1.globalId)('HttpClientRequest');
        let requestUrl;
        if (typeof url === 'string') {
            if (!exports.PROTO_RE.test(url)) {
                // Support `request('www.server.com')`
                url = 'http://' + url;
            }
            requestUrl = new URL(url);
        }
        else {
            if (!url.searchParams) {
                // url maybe url.parse(url) object in urllib2
                requestUrl = new URL((0, node_url_1.format)(url));
            }
            else {
                // or even if not, we clone to avoid mutating it
                requestUrl = new URL(url.toString());
            }
        }
        const method = (options?.type || options?.method || 'GET').toUpperCase();
        const originalHeaders = options?.headers;
        const headers = {};
        const args = {
            retry: 0,
            socketErrorRetry: 1,
            timing: true,
            ...this.#defaultArgs,
            ...options,
            // keep method and headers exists on args for request event handler to easy use
            method,
            headers,
        };
        requestContext = {
            retries: 0,
            socketErrorRetries: 0,
            redirects: 0,
            history: [],
            ...requestContext,
        };
        if (!requestContext.requestStartTime) {
            requestContext.requestStartTime = node_perf_hooks_1.performance.now();
        }
        requestContext.history.push(requestUrl.href);
        const requestStartTime = requestContext.requestStartTime;
        // https://developer.chrome.com/docs/devtools/network/reference/?utm_source=devtools#timing-explanation
        const timing = {
            // socket assigned
            queuing: 0,
            // dns lookup time
            dnslookup: 0,
            // socket connected
            connected: 0,
            // request headers sent
            requestHeadersSent: 0,
            // request sent, including headers and body
            requestSent: 0,
            // Time to first byte (TTFB), the response headers have been received
            waiting: 0,
            // the response body and trailers have been received
            contentDownload: 0,
        };
        const originalOpaque = args.opaque;
        // using opaque to diagnostics channel, binding request and socket
        const internalOpaque = {
            [symbols_js_2.default.kRequestId]: requestId,
            [symbols_js_2.default.kRequestStartTime]: requestStartTime,
            [symbols_js_2.default.kEnableRequestTiming]: !!args.timing,
            [symbols_js_2.default.kRequestTiming]: timing,
            [symbols_js_2.default.kRequestOriginalOpaque]: originalOpaque,
        };
        const reqMeta = {
            requestId,
            url: requestUrl.href,
            args,
            ctx: args.ctx,
            retries: requestContext.retries,
        };
        const socketInfo = {
            id: 0,
            localAddress: '',
            localPort: 0,
            remoteAddress: '',
            remotePort: 0,
            remoteFamily: '',
            bytesWritten: 0,
            bytesRead: 0,
            handledRequests: 0,
            handledResponses: 0,
        };
        // keep urllib createCallbackResponse style
        const resHeaders = {};
        let res = {
            status: -1,
            statusCode: -1,
            statusText: '',
            statusMessage: '',
            headers: resHeaders,
            size: 0,
            aborted: false,
            rt: 0,
            keepAliveSocket: true,
            requestUrls: requestContext.history,
            timing,
            socket: socketInfo,
            retries: requestContext.retries,
            socketErrorRetries: requestContext.socketErrorRetries,
        };
        let headersTimeout = 5000;
        let bodyTimeout = 5000;
        if (args.timeout) {
            if (Array.isArray(args.timeout)) {
                headersTimeout = args.timeout[0] ?? headersTimeout;
                bodyTimeout = args.timeout[1] ?? bodyTimeout;
            }
            else {
                headersTimeout = bodyTimeout = args.timeout;
            }
        }
        if (originalHeaders) {
            // convert headers to lower-case
            for (const name in originalHeaders) {
                headers[name.toLowerCase()] = originalHeaders[name];
            }
        }
        // hidden user-agent
        const hiddenUserAgent = 'user-agent' in headers && !headers['user-agent'];
        if (hiddenUserAgent) {
            delete headers['user-agent'];
        }
        else if (!headers['user-agent']) {
            // need to set user-agent
            headers['user-agent'] = exports.HEADER_USER_AGENT;
        }
        // Alias to dataType = 'stream'
        if (args.streaming || args.customResponse) {
            args.dataType = 'stream';
        }
        if (args.dataType === 'json' && !headers.accept) {
            headers.accept = 'application/json';
        }
        // gzip alias to compressed
        if (args.gzip && args.compressed !== false) {
            args.compressed = true;
        }
        if (args.compressed && !headers['accept-encoding']) {
            headers['accept-encoding'] = 'gzip, br';
        }
        if (requestContext.retries > 0) {
            headers['x-urllib-retry'] = `${requestContext.retries}/${args.retry}`;
        }
        if (requestContext.socketErrorRetries > 0) {
            headers['x-urllib-retry-on-socket-error'] = `${requestContext.socketErrorRetries}/${args.socketErrorRetry}`;
        }
        if (args.auth && !headers.authorization) {
            headers.authorization = `Basic ${Buffer.from(args.auth).toString('base64')}`;
        }
        // streaming request should disable socketErrorRetry and retry
        let isStreamingRequest = false;
        let isStreamingResponse = false;
        if (args.dataType === 'stream' || args.writeStream) {
            isStreamingResponse = true;
        }
        let maxRedirects = args.maxRedirects ?? 10;
        try {
            const requestOptions = {
                method,
                // disable undici auto redirect handler
                maxRedirections: 0,
                headersTimeout,
                headers,
                bodyTimeout,
                opaque: internalOpaque,
                dispatcher: args.dispatcher ?? this.#dispatcher,
                signal: args.signal,
                reset: false,
            };
            if (typeof args.highWaterMark === 'number') {
                requestOptions.highWaterMark = args.highWaterMark;
            }
            if (typeof args.reset === 'boolean') {
                requestOptions.reset = args.reset;
            }
            if (args.followRedirect === false) {
                maxRedirects = 0;
            }
            const isGETOrHEAD = requestOptions.method === 'GET' || requestOptions.method === 'HEAD';
            // alias to args.content
            if (args.stream && !args.content) {
                // convert old style stream to new stream
                // https://nodejs.org/dist/latest-v18.x/docs/api/stream.html#readablewrapstream
                if ((0, utils_js_1.isReadable)(args.stream) && !(args.stream instanceof node_stream_1.Readable)) {
                    debug('Request#%d convert old style stream to Readable', requestId);
                    args.stream = new node_stream_1.Readable().wrap(args.stream);
                    isStreamingRequest = true;
                }
                else if (args.stream instanceof formstream_1.default) {
                    debug('Request#%d convert formstream to Readable', requestId);
                    args.stream = new node_stream_1.Readable().wrap(args.stream);
                    isStreamingRequest = true;
                }
                args.content = args.stream;
            }
            if (args.files) {
                if (isGETOrHEAD) {
                    requestOptions.method = 'POST';
                }
                const formData = new FormData_js_1.FormData();
                const uploadFiles = [];
                if (Array.isArray(args.files)) {
                    for (const [index, file] of args.files.entries()) {
                        const field = index === 0 ? 'file' : `file${index}`;
                        uploadFiles.push([field, file]);
                    }
                }
                else if (args.files instanceof node_stream_1.Readable || (0, utils_js_1.isReadable)(args.files)) {
                    uploadFiles.push(['file', args.files]);
                }
                else if (typeof args.files === 'string' || Buffer.isBuffer(args.files)) {
                    uploadFiles.push(['file', args.files]);
                }
                else if (typeof args.files === 'object') {
                    const files = args.files;
                    for (const field in files) {
                        // set custom fileName
                        const file = files[field];
                        uploadFiles.push([field, file, field]);
                    }
                }
                // set normal fields first
                if (args.data) {
                    for (const field in args.data) {
                        formData.append(field, args.data[field]);
                    }
                }
                for (const [index, [field, file, customFileName]] of uploadFiles.entries()) {
                    let fileName = '';
                    let value;
                    if (typeof file === 'string') {
                        fileName = (0, node_path_1.basename)(file);
                        value = (0, node_fs_1.createReadStream)(file);
                    }
                    else if (Buffer.isBuffer(file)) {
                        fileName = customFileName || `bufferfile${index}`;
                        value = file;
                    }
                    else if (file instanceof node_stream_1.Readable || (0, utils_js_1.isReadable)(file)) {
                        fileName = getFileName(file) || customFileName || `streamfile${index}`;
                        isStreamingRequest = true;
                        value = file;
                    }
                    const mimeType = mime_types_1.default.lookup(fileName) || '';
                    formData.append(field, value, {
                        filename: fileName,
                        contentType: mimeType,
                    });
                    debug('formData append field: %s, mimeType: %s, fileName: %s', field, mimeType, fileName);
                }
                Object.assign(headers, formData.getHeaders());
                requestOptions.body = formData;
            }
            else if (args.content) {
                if (!isGETOrHEAD) {
                    // handle content
                    requestOptions.body = args.content;
                    if (args.contentType) {
                        headers['content-type'] = args.contentType;
                    }
                    else if (typeof args.content === 'string' && !headers['content-type']) {
                        headers['content-type'] = 'text/plain;charset=UTF-8';
                    }
                    isStreamingRequest = (0, utils_js_1.isReadable)(args.content);
                }
            }
            else if (args.data) {
                const isStringOrBufferOrReadable = typeof args.data === 'string'
                    || Buffer.isBuffer(args.data)
                    || (0, utils_js_1.isReadable)(args.data);
                if (isGETOrHEAD) {
                    if (!isStringOrBufferOrReadable) {
                        let query;
                        if (args.nestedQuerystring) {
                            query = qs_1.default.stringify(args.data);
                        }
                        else {
                            query = node_querystring_1.default.stringify(args.data);
                        }
                        // reset the requestUrl
                        const href = requestUrl.href;
                        requestUrl = new URL(href + (href.includes('?') ? '&' : '?') + query);
                    }
                }
                else {
                    if (isStringOrBufferOrReadable) {
                        requestOptions.body = args.data;
                        isStreamingRequest = (0, utils_js_1.isReadable)(args.data);
                    }
                    else {
                        if (args.contentType === 'json'
                            || args.contentType === 'application/json'
                            || headers['content-type']?.startsWith('application/json')) {
                            requestOptions.body = JSON.stringify(args.data);
                            if (!headers['content-type']) {
                                headers['content-type'] = 'application/json';
                            }
                        }
                        else {
                            headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
                            if (args.nestedQuerystring) {
                                requestOptions.body = qs_1.default.stringify(args.data);
                            }
                            else {
                                requestOptions.body = new URLSearchParams(args.data).toString();
                            }
                        }
                    }
                }
            }
            if (isStreamingRequest) {
                args.retry = 0;
                args.socketErrorRetry = 0;
                maxRedirects = 0;
            }
            if (isStreamingResponse) {
                args.retry = 0;
                args.socketErrorRetry = 0;
            }
            debug('Request#%d %s %s, headers: %j, headersTimeout: %s, bodyTimeout: %s, isStreamingRequest: %s, isStreamingResponse: %s, maxRedirections: %s, redirects: %s', requestId, requestOptions.method, requestUrl.href, headers, headersTimeout, bodyTimeout, isStreamingRequest, isStreamingResponse, maxRedirects, requestContext.redirects);
            requestOptions.headers = headers;
            exports.channels.request.publish({
                request: reqMeta,
            });
            if (this.listenerCount('request') > 0) {
                this.emit('request', reqMeta);
            }
            let response = await (0, undici_1.request)(requestUrl, requestOptions);
            if (response.statusCode === 401 && (response.headers['www-authenticate'] || response.headers['x-www-authenticate']) &&
                !requestOptions.headers.authorization && args.digestAuth) {
                // handle digest auth
                const authenticateHeaders = response.headers['www-authenticate'] ?? response.headers['x-www-authenticate'];
                const authenticate = Array.isArray(authenticateHeaders)
                    ? authenticateHeaders.find(authHeader => authHeader.startsWith('Digest '))
                    : authenticateHeaders;
                if (authenticate && authenticate.startsWith('Digest ')) {
                    debug('Request#%d %s: got digest auth header WWW-Authenticate: %s', requestId, requestUrl.href, authenticate);
                    requestOptions.headers.authorization = (0, utils_js_1.digestAuthHeader)(requestOptions.method, `${requestUrl.pathname}${requestUrl.search}`, authenticate, args.digestAuth);
                    debug('Request#%d %s: auth with digest header: %s', requestId, url, requestOptions.headers.authorization);
                    if (Array.isArray(response.headers['set-cookie'])) {
                        // FIXME: merge exists cookie header
                        requestOptions.headers.cookie = response.headers['set-cookie'].join(';');
                    }
                    // Ensure the previous response is consumed as we re-use the same variable
                    await response.body.arrayBuffer();
                    response = await (0, undici_1.request)(requestUrl, requestOptions);
                }
            }
            const contentEncoding = response.headers['content-encoding'];
            const isCompressedContent = contentEncoding === 'gzip' || contentEncoding === 'br';
            res.headers = response.headers;
            res.status = res.statusCode = response.statusCode;
            res.statusMessage = res.statusText = node_http_1.STATUS_CODES[res.status] || '';
            if (res.headers['content-length']) {
                res.size = parseInt(res.headers['content-length']);
            }
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
            if (RedirectStatusCodes.includes(res.statusCode) && maxRedirects > 0 && requestContext.redirects < maxRedirects) {
                if (res.headers.location) {
                    requestContext.redirects++;
                    const nextUrl = new URL(res.headers.location, requestUrl.href);
                    // Ensure the response is consumed
                    await response.body.arrayBuffer();
                    debug('Request#%d got response, status: %s, headers: %j, timing: %j, redirect to %s', requestId, res.status, res.headers, res.timing, nextUrl.href);
                    return await this.#requestInternal(nextUrl.href, options, requestContext);
                }
            }
            let data = null;
            if (args.dataType === 'stream') {
                // only auto decompress on request args.compressed = true
                if (args.compressed === true && isCompressedContent) {
                    // gzip or br
                    const decoder = contentEncoding === 'gzip' ? (0, node_zlib_1.createGunzip)() : (0, node_zlib_1.createBrotliDecompress)();
                    res = Object.assign((0, node_stream_1.pipeline)(response.body, decoder, noop), res);
                }
                else {
                    res = Object.assign(response.body, res);
                }
            }
            else if (args.writeStream) {
                if (args.compressed === true && isCompressedContent) {
                    const decoder = contentEncoding === 'gzip' ? (0, node_zlib_1.createGunzip)() : (0, node_zlib_1.createBrotliDecompress)();
                    await (0, promises_1.pipeline)(response.body, decoder, args.writeStream);
                }
                else {
                    await (0, promises_1.pipeline)(response.body, args.writeStream);
                }
            }
            else {
                // buffer
                data = Buffer.from(await response.body.arrayBuffer());
                if (isCompressedContent && data.length > 0) {
                    try {
                        data = contentEncoding === 'gzip' ? (0, node_zlib_1.gunzipSync)(data) : (0, node_zlib_1.brotliDecompressSync)(data);
                    }
                    catch (err) {
                        if (err.name === 'Error') {
                            err.name = 'UnzipError';
                        }
                        throw err;
                    }
                }
                if (args.dataType === 'text' || args.dataType === 'html') {
                    data = data.toString();
                }
                else if (args.dataType === 'json') {
                    if (data.length === 0) {
                        data = null;
                    }
                    else {
                        data = (0, utils_js_1.parseJSON)(data.toString(), args.fixJSONCtlChars);
                    }
                }
            }
            res.rt = (0, utils_js_1.performanceTime)(requestStartTime);
            // get real socket info from internalOpaque
            (0, utils_js_1.updateSocketInfo)(socketInfo, internalOpaque);
            const clientResponse = {
                opaque: originalOpaque,
                data,
                status: res.status,
                statusCode: res.status,
                statusText: res.statusText,
                headers: res.headers,
                url: requestUrl.href,
                redirected: requestContext.history.length > 1,
                requestUrls: res.requestUrls,
                res,
            };
            debug('Request#%d got response, status: %s, headers: %j, timing: %j, socket: %j', requestId, res.status, res.headers, res.timing, res.socket);
            if (args.retry > 0 && requestContext.retries < args.retry) {
                const isRetry = args.isRetry ?? defaultIsRetry;
                if (isRetry(clientResponse)) {
                    if (args.retryDelay) {
                        await (0, promises_2.setTimeout)(args.retryDelay);
                    }
                    requestContext.retries++;
                    return await this.#requestInternal(url, options, requestContext);
                }
            }
            exports.channels.response.publish({
                request: reqMeta,
                response: res,
            });
            if (this.listenerCount('response') > 0) {
                this.emit('response', {
                    requestId,
                    error: null,
                    ctx: args.ctx,
                    req: {
                        ...reqMeta,
                        options: args,
                    },
                    res,
                });
            }
            return clientResponse;
        }
        catch (rawError) {
            debug('Request#%d throw error: %s, socketErrorRetry: %s, socketErrorRetries: %s', requestId, rawError, args.socketErrorRetry, requestContext.socketErrorRetries);
            let err = rawError;
            if (err.name === 'HeadersTimeoutError') {
                err = new HttpClientError_js_1.HttpClientRequestTimeoutError(headersTimeout, { cause: err });
            }
            else if (err.name === 'BodyTimeoutError') {
                err = new HttpClientError_js_1.HttpClientRequestTimeoutError(bodyTimeout, { cause: err });
            }
            else if (err.name === 'InformationalError' && err.message.includes('stream timeout')) {
                err = new HttpClientError_js_1.HttpClientRequestTimeoutError(bodyTimeout, { cause: err });
            }
            else if (err.code === 'UND_ERR_CONNECT_TIMEOUT') {
                err = new HttpClientError_js_1.HttpClientConnectTimeoutError(err.message, err.code, { cause: err });
            }
            else if (err.code === 'UND_ERR_SOCKET' || err.code === 'ECONNRESET') {
                // auto retry on socket error, https://github.com/node-modules/urllib/issues/454
                if (args.socketErrorRetry > 0 && requestContext.socketErrorRetries < args.socketErrorRetry) {
                    requestContext.socketErrorRetries++;
                    debug('Request#%d retry on socket error, socketErrorRetries: %d', requestId, requestContext.socketErrorRetries);
                    return await this.#requestInternal(url, options, requestContext);
                }
            }
            err.opaque = originalOpaque;
            err.status = res.status;
            err.headers = res.headers;
            err.res = res;
            if (err.socket) {
                // store rawSocket
                err._rawSocket = err.socket;
            }
            err.socket = socketInfo;
            res.rt = (0, utils_js_1.performanceTime)(requestStartTime);
            (0, utils_js_1.updateSocketInfo)(socketInfo, internalOpaque, rawError);
            exports.channels.response.publish({
                request: reqMeta,
                response: res,
                error: err,
            });
            if (this.listenerCount('response') > 0) {
                this.emit('response', {
                    requestId,
                    error: err,
                    ctx: args.ctx,
                    req: {
                        ...reqMeta,
                        options: args,
                    },
                    res,
                });
            }
            throw err;
        }
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHR0cENsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IdHRwQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdGQUEwRDtBQUMxRCw2Q0FBMkM7QUFFM0MseUNBQXlDO0FBQ3pDLHlDQUFxQztBQUNyQyx5Q0FLbUI7QUFDbkIsNkNBQWlEO0FBQ2pELG1EQUFtRTtBQUNuRSx5Q0FBcUM7QUFDckMscUNBQTJDO0FBQzNDLHVDQUErQztBQUMvQyxxREFBOEM7QUFDOUMsd0VBQTJDO0FBQzNDLG1EQUEyRDtBQUMzRCxtQ0FNZ0I7QUFDaEIsNkRBQTZEO0FBQzdELGFBQWE7QUFDYiw0RUFBdUQ7QUFDdkQsNERBQThCO0FBQzlCLDRDQUFvQjtBQUNwQix1Q0FBdUM7QUFDdkMsNERBQW9DO0FBQ3BDLCtDQUF5QztBQUN6QyxpREFBaUU7QUFJakUseUNBQWtIO0FBQ2xILDhEQUFtQztBQUNuQyxtRUFBaUU7QUFDakUsNkRBQW9HO0FBT3ZGLFFBQUEsUUFBUSxHQUFHLGVBQWUsQ0FBQztBQTBCeEMsU0FBUyxJQUFJO0lBQ1gsT0FBTztBQUNULENBQUM7QUFFRCxNQUFNLEtBQUssR0FBRyxJQUFBLG9CQUFRLEVBQUMsbUJBQW1CLENBQUMsQ0FBQztBQXdDL0IsUUFBQSxPQUFPLEdBQUcsU0FBUyxDQUFDO0FBQ2pDLG9EQUFvRDtBQUN2QyxRQUFBLGlCQUFpQixHQUM1QixlQUFlLGVBQU8sWUFBWSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUUxRyxTQUFTLFdBQVcsQ0FBQyxNQUFnQjtJQUNuQyxNQUFNLFFBQVEsR0FBWSxNQUFjLENBQUMsSUFBSSxDQUFDO0lBQzlDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDYixPQUFPLElBQUEsb0JBQVEsRUFBQyxRQUFRLENBQUMsQ0FBQztJQUM1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