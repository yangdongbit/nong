"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDiagnosticsChannel = initDiagnosticsChannel;
const node_diagnostics_channel_1 = __importDefault(require("node:diagnostics_channel"));
const node_perf_hooks_1 = require("node:perf_hooks");
const node_util_1 = require("node:util");
const node_net_1 = require("node:net");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const symbols_js_1 = __importDefault(require("./symbols.js"));
const utils_js_1 = require("./utils.js");
const debug = (0, node_util_1.debuglog)('urllib/diagnosticsChannel');
let initedDiagnosticsChannel = false;
// https://undici.nodejs.org/#/docs/api/DiagnosticsChannel
// client --> server
// undici:request:create => { request }
//   -> [optional] undici:client:connected => { socket } [first request will create socket]
//   -> undici:client:sendHeaders => { socket, request }
//     -> undici:request:bodySent => { request }
//
// server --> client
// undici:request:headers => { request, response }
//   -> undici:request:trailers => { request, trailers }
function subscribe(name, listener) {
    node_diagnostics_channel_1.default.subscribe(name, listener);
}
let kSocketReset;
function formatSocket(socket) {
    if (!socket)
        return socket;
    if (!kSocketReset) {
        const symbols = Object.getOwnPropertySymbols(socket);
        for (const symbol of symbols) {
            if (symbol.description === 'reset') {
                kSocketReset = symbol;
                break;
            }
        }
    }
    return {
        localAddress: socket[symbols_js_1.default.kSocketLocalAddress],
        localPort: socket[symbols_js_1.default.kSocketLocalPort],
        remoteAddress: socket.remoteAddress,
        remotePort: socket.remotePort,
        attemptedAddresses: socket.autoSelectFamilyAttemptedAddresses,
        connecting: socket.connecting,
        reset: socket[kSocketReset],
    };
}
// make sure error contains socket info
const destroySocket = node_net_1.Socket.prototype.destroy;
node_net_1.Socket.prototype.destroy = function (err) {
    if (err) {
        Object.defineProperty(err, symbols_js_1.default.kErrorSocket, {
            // don't show on console log
            enumerable: false,
            value: this,
        });
    }
    return destroySocket.call(this, err);
};
function getRequestOpaque(request, kHandler) {
    if (!kHandler)
        return;
    const handler = Reflect.get(request, kHandler);
    // maxRedirects = 0 will get [Symbol(handler)]: RequestHandler {
    // responseHeaders: null,
    // opaque: {
    //   [Symbol(request id)]: 1,
    //   [Symbol(request start time)]: 465.0712921619415,
    //   [Symbol(enable request timing or not)]: true,
    //   [Symbol(request timing)]: [Object],
    //   [Symbol(request original opaque)]: undefined
    // }
    return handler?.opts?.opaque ?? handler?.opaque;
}
function initDiagnosticsChannel() {
    // make sure init global DiagnosticsChannel once
    if (initedDiagnosticsChannel)
        return;
    initedDiagnosticsChannel = true;
    let kHandler;
    // This message is published when a new outgoing request is created.
    // Note: a request is only loosely completed to a given socket.
    subscribe('undici:request:create', (message, name) => {
        const { request } = message;
        if (!kHandler) {
            const symbols = Object.getOwnPropertySymbols(request);
            for (const symbol of symbols) {
                if (symbol.description === 'handler') {
                    kHandler = symbol;
                    break;
                }
            }
        }
        const opaque = getRequestOpaque(request, kHandler);
        // ignore non HttpClient Request
        if (!opaque || !opaque[symbols_js_1.default.kRequestId])
            return;
        Reflect.set(request, symbols_js_1.default.kRequestInternalOpaque, opaque);
        debug('[%s] Request#%d %s %s, path: %s, headers: %j', name, opaque[symbols_js_1.default.kRequestId], request.method, request.origin, request.path, request.headers);
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].queuing = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    subscribe('undici:client:connectError', (message, name) => {
        const { error, connectParams, socket } = message;
        let sock = socket;
        if (!sock && error[symbols_js_1.default.kErrorSocket]) {
            sock = error[symbols_js_1.default.kErrorSocket];
        }
        if (sock) {
            sock[symbols_js_1.default.kSocketId] = (0, utils_js_1.globalId)('UndiciSocket');
            sock[symbols_js_1.default.kSocketConnectErrorTime] = new Date();
            sock[symbols_js_1.default.kHandledRequests] = 0;
            sock[symbols_js_1.default.kHandledResponses] = 0;
            // copy local address to symbol, avoid them be reset after request error throw
            if (sock.localAddress) {
                sock[symbols_js_1.default.kSocketLocalAddress] = sock.localAddress;
                sock[symbols_js_1.default.kSocketLocalPort] = sock.localPort;
            }
            sock[symbols_js_1.default.kSocketConnectProtocol] = connectParams.protocol;
            sock[symbols_js_1.default.kSocketConnectHost] = connectParams.host;
            sock[symbols_js_1.default.kSocketConnectPort] = connectParams.port;
            debug('[%s] Socket#%d connectError, connectParams: %j, error: %s, (sock: %j)', name, sock[symbols_js_1.default.kSocketId], connectParams, error.message, formatSocket(sock));
        }
        else {
            debug('[%s] connectError, connectParams: %j, error: %o', name, connectParams, error);
        }
    });
    // This message is published after a connection is established.
    subscribe('undici:client:connected', (message, name) => {
        const { socket, connectParams } = message;
        socket[symbols_js_1.default.kSocketId] = (0, utils_js_1.globalId)('UndiciSocket');
        socket[symbols_js_1.default.kSocketStartTime] = node_perf_hooks_1.performance.now();
        socket[symbols_js_1.default.kSocketConnectedTime] = new Date();
        socket[symbols_js_1.default.kHandledRequests] = 0;
        socket[symbols_js_1.default.kHandledResponses] = 0;
        // copy local address to symbol, avoid them be reset after request error throw
        socket[symbols_js_1.default.kSocketLocalAddress] = socket.localAddress;
        socket[symbols_js_1.default.kSocketLocalPort] = socket.localPort;
        socket[symbols_js_1.default.kSocketConnectProtocol] = connectParams.protocol;
        socket[symbols_js_1.default.kSocketConnectHost] = connectParams.host;
        socket[symbols_js_1.default.kSocketConnectPort] = connectParams.port;
        debug('[%s] Socket#%d connected (sock: %j)', name, socket[symbols_js_1.default.kSocketId], formatSocket(socket));
    });
    // This message is published right before the first byte of the request is written to the socket.
    subscribe('undici:client:sendHeaders', (message, name) => {
        const { request, socket } = message;
        const opaque = Reflect.get(request, symbols_js_1.default.kRequestInternalOpaque);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId]) {
            debug('[%s] opaque not found', name);
            return;
        }
        socket[symbols_js_1.default.kHandledRequests]++;
        // attach socket to opaque
        opaque[symbols_js_1.default.kRequestSocket] = socket;
        debug('[%s] Request#%d send headers on Socket#%d (handled %d requests, sock: %j)', name, opaque[symbols_js_1.default.kRequestId], socket[symbols_js_1.default.kSocketId], socket[symbols_js_1.default.kHandledRequests], formatSocket(socket));
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].requestHeadersSent = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
        // first socket need to calculate the connected time
        if (socket[symbols_js_1.default.kHandledRequests] === 1) {
            // kSocketStartTime - kRequestStartTime = connected time
            opaque[symbols_js_1.default.kRequestTiming].connected =
                (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime], socket[symbols_js_1.default.kSocketStartTime]);
        }
    });
    subscribe('undici:request:bodySent', (message, name) => {
        const { request } = message;
        const opaque = Reflect.get(request, symbols_js_1.default.kRequestInternalOpaque);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId]) {
            debug('[%s] opaque not found', name);
            return;
        }
        debug('[%s] Request#%d send body', name, opaque[symbols_js_1.default.kRequestId]);
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].requestSent = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // This message is published after the response headers have been received, i.e. the response has been completed.
    subscribe('undici:request:headers', (message, name) => {
        const { request, response } = message;
        const opaque = Reflect.get(request, symbols_js_1.default.kRequestInternalOpaque);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId]) {
            debug('[%s] opaque not found', name);
            return;
        }
        // get socket from opaque
        const socket = opaque[symbols_js_1.default.kRequestSocket];
        if (socket) {
            socket[symbols_js_1.default.kHandledResponses]++;
            debug('[%s] Request#%d get %s response headers on Socket#%d (handled %d responses, sock: %j)', name, opaque[symbols_js_1.default.kRequestId], response.statusCode, socket[symbols_js_1.default.kSocketId], socket[symbols_js_1.default.kHandledResponses], formatSocket(socket));
        }
        else {
            debug('[%s] Request#%d get %s response headers on Unknown Socket', name, opaque[symbols_js_1.default.kRequestId], response.statusCode);
        }
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].waiting = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // This message is published after the response body and trailers have been received, i.e. the response has been completed.
    subscribe('undici:request:trailers', (message, name) => {
        const { request } = message;
        const opaque = Reflect.get(request, symbols_js_1.default.kRequestInternalOpaque);
        if (!opaque || !opaque[symbols_js_1.default.kRequestId]) {
            debug('[%s] opaque not found', name);
            return;
        }
        debug('[%s] Request#%d get response body and trailers', name, opaque[symbols_js_1.default.kRequestId]);
        if (!opaque[symbols_js_1.default.kEnableRequestTiming])
            return;
        opaque[symbols_js_1.default.kRequestTiming].contentDownload = (0, utils_js_1.performanceTime)(opaque[symbols_js_1.default.kRequestStartTime]);
    });
    // This message is published if the request is going to error, but it has not errored yet.
    // subscribe('undici:request:error', (message, name) => {
    //   const { request, error } = message as DiagnosticsChannel.RequestErrorMessage;
    //   const opaque = request[kHandler]?.opts?.opaque;
    //   if (!opaque || !opaque[symbols.kRequestId]) return;
    //   const socket = opaque[symbols.kRequestSocket];
    //   debug('[%s] Request#%d error on Socket#%d (handled %d responses, sock: %o), error: %o',
    //     name, opaque[symbols.kRequestId], socket[symbols.kSocketId], socket[symbols.kHandledResponses],
    //     formatSocket(socket), error);
    // });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3NDaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RpYWdub3N0aWNzQ2hhbm5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQWtGQSx3REFtS0M7QUFyUEQsd0ZBQTBEO0FBQzFELHFEQUE4QztBQUM5Qyx5Q0FBcUM7QUFDckMsdUNBQWtDO0FBRWxDLDZEQUE2RDtBQUM3RCxhQUFhO0FBQ2IsOERBQW1DO0FBQ25DLHlDQUF1RDtBQUV2RCxNQUFNLEtBQUssR0FBRyxJQUFBLG9CQUFRLEVBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUNwRCxJQUFJLHdCQUF3QixHQUFHLEtBQUssQ0FBQztBQUNyQywwREFBMEQ7QUFDMUQsb0JBQW9CO0FBQ3BCLHVDQUF1QztBQUN2QywyRkFBMkY7QUFDM0Ysd0RBQXdEO0FBQ3hELGdEQUFnRDtBQUNoRCxFQUFFO0FBQ0Ysb0JBQW9CO0FBQ3BCLGtEQUFrRDtBQUNsRCx3REFBd0Q7QUFFeEQsU0FBUyxTQUFTLENBQUMsSUFBWSxFQUFFLFFBQWtFO0lBQ2pHLGtDQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQU1ELElBQUksWUFBb0IsQ0FBQztBQUN6QixTQUFTLFlBQVksQ0FBQyxNQUFvQjtJQUN4QyxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU8sTUFBTSxDQUFDO0lBQzNCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM3QixJQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ25DLFlBQVksR0FBRyxNQUFNLENBQUM7Z0JBQ3RCLE1BQU07WUFDUixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFD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