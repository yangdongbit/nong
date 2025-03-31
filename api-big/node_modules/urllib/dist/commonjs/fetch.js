"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = exports.FetchFactory = void 0;
const node_async_hooks_1 = require("node:async_hooks");
const node_util_1 = require("node:util");
const undici_1 = require("undici");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const symbols_js_1 = __importDefault(require("undici/lib/core/symbols.js"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const response_js_1 = require("undici/lib/web/fetch/response.js");
const HttpClient_js_1 = require("./HttpClient.js");
const HttpAgent_js_1 = require("./HttpAgent.js");
const diagnosticsChannel_js_1 = require("./diagnosticsChannel.js");
const utils_js_1 = require("./utils.js");
const symbols_js_2 = __importDefault(require("./symbols.js"));
const BaseAgent_js_1 = require("./BaseAgent.js");
const debug = (0, node_util_1.debuglog)('urllib/fetch');
class FetchFactory {
    static #dispatcher;
    static #opaqueLocalStorage = new node_async_hooks_1.AsyncLocalStorage();
    static getDispatcher() {
        return FetchFactory.#dispatcher ?? (0, undici_1.getGlobalDispatcher)();
    }
    static setDispatcher(dispatcher) {
        FetchFactory.#dispatcher = dispatcher;
    }
    static setClientOptions(clientOptions) {
        let dispatcherOption = {
            opaqueLocalStorage: FetchFactory.#opaqueLocalStorage,
        };
        let dispatcherClazz = BaseAgent_js_1.BaseAgent;
        if (clientOptions?.lookup || clientOptions?.checkAddress) {
            dispatcherOption = {
                ...dispatcherOption,
                lookup: clientOptions.lookup,
                checkAddress: clientOptions.checkAddress,
                connect: clientOptions.connect,
                allowH2: clientOptions.allowH2,
            };
            dispatcherClazz = HttpAgent_js_1.HttpAgent;
        }
        else if (clientOptions?.connect) {
            dispatcherOption = {
                ...dispatcherOption,
                connect: clientOptions.connect,
                allowH2: clientOptions.allowH2,
            };
            dispatcherClazz = BaseAgent_js_1.BaseAgent;
        }
        else if (clientOptions?.allowH2) {
            // Support HTTP2
            dispatcherOption = {
                ...dispatcherOption,
                allowH2: clientOptions.allowH2,
            };
            dispatcherClazz = BaseAgent_js_1.BaseAgent;
        }
        FetchFactory.#dispatcher = new dispatcherClazz(dispatcherOption);
        (0, diagnosticsChannel_js_1.initDiagnosticsChannel)();
    }
    static getDispatcherPoolStats() {
        const agent = FetchFactory.getDispatcher();
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
    static async fetch(input, init) {
        const requestStartTime = performance.now();
        init = init ?? {};
        init.dispatcher = init.dispatcher ?? FetchFactory.#dispatcher;
        const request = new undici_1.Request(input, init);
        const requestId = (0, utils_js_1.globalId)('HttpClientRequest');
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
        // using opaque to diagnostics channel, binding request and socket
        const internalOpaque = {
            [symbols_js_2.default.kRequestId]: requestId,
            [symbols_js_2.default.kRequestStartTime]: requestStartTime,
            [symbols_js_2.default.kEnableRequestTiming]: !!(init.timing ?? true),
            [symbols_js_2.default.kRequestTiming]: timing,
            // [symbols.kRequestOriginalOpaque]: originalOpaque,
        };
        const reqMeta = {
            requestId,
            url: request.url,
            args: {
                method: request.method,
                type: request.method,
                data: request.body,
                headers: (0, utils_js_1.convertHeader)(request.headers),
            },
            retries: 0,
        };
        const fetchMeta = {
            requestId,
            request,
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
        HttpClient_js_1.channels.request.publish({
            request: reqMeta,
        });
        HttpClient_js_1.channels.fetchRequest.publish({
            fetch: fetchMeta,
        });
        let res;
        // keep urllib createCallbackResponse style
        const resHeaders = {};
        const urllibResponse = {
            status: -1,
            statusCode: -1,
            statusText: '',
            statusMessage: '',
            headers: resHeaders,
            size: 0,
            aborted: false,
            rt: 0,
            keepAliveSocket: true,
            requestUrls: [
                request.url,
            ],
            timing,
            socket: socketInfo,
            retries: 0,
            socketErrorRetries: 0,
        };
        try {
            await FetchFactory.#opaqueLocalStorage.run(internalOpaque, async () => {
                res = await (0, undici_1.fetch)(request);
            });
        }
        catch (e) {
            (0, utils_js_1.updateSocketInfo)(socketInfo, internalOpaque, e);
            urllibResponse.rt = (0, utils_js_1.performanceTime)(requestStartTime);
            debug('Request#%d throw error: %s', requestId, e);
            HttpClient_js_1.channels.fetchResponse.publish({
                fetch: fetchMeta,
                error: e,
            });
            HttpClient_js_1.channels.response.publish({
                request: reqMeta,
                response: urllibResponse,
                error: e,
            });
            throw e;
        }
        // get undici internal response
        const state = (0, response_js_1.getResponseState)(res);
        (0, utils_js_1.updateSocketInfo)(socketInfo, internalOpaque);
        urllibResponse.headers = (0, utils_js_1.convertHeader)(res.headers);
        urllibResponse.status = urllibResponse.statusCode = res.status;
        urllibResponse.statusMessage = res.statusText;
        if (urllibResponse.headers['content-length']) {
            urllibResponse.size = parseInt(urllibResponse.headers['content-length']);
        }
        urllibResponse.rt = (0, utils_js_1.performanceTime)(requestStartTime);
        debug('Request#%d got response, status: %s, headers: %j, timing: %j, socket: %j', requestId, urllibResponse.status, urllibResponse.headers, timing, urllibResponse.socket);
        HttpClient_js_1.channels.fetchResponse.publish({
            fetch: fetchMeta,
            timingInfo: state.timingInfo,
            response: res,
        });
        HttpClient_js_1.channels.response.publish({
            request: reqMeta,
            response: urllibResponse,
        });
        return res;
    }
}
exports.FetchFactory = FetchFactory;
exports.fetch = FetchFactory.fetch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsdURBQXFEO0FBQ3JELHlDQUFxQztBQUNyQyxtQ0FVZ0I7QUFDaEIsNkRBQTZEO0FBQzdELGFBQWE7QUFDYiw0RUFBdUQ7QUFDdkQsNkRBQTZEO0FBQzdELGFBQWE7QUFDYixrRUFBb0U7QUFDcEUsbURBT3lCO0FBQ3pCLGlEQUd3QjtBQUN4QixtRUFBaUU7QUFDakUseUNBQXdGO0FBQ3hGLDhEQUFtQztBQVNuQyxpREFBNkQ7QUFFN0QsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGNBQWMsQ0FBQyxDQUFDO0FBa0J2QyxNQUFhLFlBQVk7SUFDdkIsTUFBTSxDQUFDLFdBQVcsQ0FBZ0M7SUFDbEQsTUFBTSxDQUFDLG1CQUFtQixHQUFHLElBQUksb0NBQWlCLEVBQWUsQ0FBQztJQUVsRSxNQUFNLENBQUMsYUFBYTtRQUNsQixPQUFPLFlBQVksQ0FBQyxXQUFXLElBQUksSUFBQSw0QkFBbUIsR0FBRSxDQUFDO0lBQzNELENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQWlCO1FBQ3BDLFlBQVksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBNEI7UUFDbEQsSUFBSSxnQkFBZ0IsR0FBcUI7WUFDdkMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLG1CQUFtQjtTQUNyRCxDQUFDO1FBQ0YsSUFBSSxlQUFlLEdBQWlELHdCQUFTLENBQUM7UUFDOUUsSUFBSSxhQUFhLEVBQUUsTUFBTSxJQUFJLGFBQWEsRUFBRSxZQUFZLEVBQUUsQ0FBQztZQUN6RCxnQkFBZ0IsR0FBRztnQkFDakIsR0FBRyxnQkFBZ0I7Z0JBQ25CLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTTtnQkFDNUIsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZO2dC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