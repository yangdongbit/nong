import { AsyncLocalStorage } from 'node:async_hooks';
import { debuglog } from 'node:util';
import { fetch as UndiciFetch, Request, getGlobalDispatcher, } from 'undici';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import undiciSymbols from 'undici/lib/core/symbols.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getResponseState } from 'undici/lib/web/fetch/response.js';
import { channels, } from './HttpClient.js';
import { HttpAgent, } from './HttpAgent.js';
import { initDiagnosticsChannel } from './diagnosticsChannel.js';
import { convertHeader, globalId, performanceTime, updateSocketInfo } from './utils.js';
import symbols from './symbols.js';
import { BaseAgent } from './BaseAgent.js';
const debug = debuglog('urllib/fetch');
export class FetchFactory {
    static #dispatcher;
    static #opaqueLocalStorage = new AsyncLocalStorage();
    static getDispatcher() {
        return FetchFactory.#dispatcher ?? getGlobalDispatcher();
    }
    static setDispatcher(dispatcher) {
        FetchFactory.#dispatcher = dispatcher;
    }
    static setClientOptions(clientOptions) {
        let dispatcherOption = {
            opaqueLocalStorage: FetchFactory.#opaqueLocalStorage,
        };
        let dispatcherClazz = BaseAgent;
        if (clientOptions?.lookup || clientOptions?.checkAddress) {
            dispatcherOption = {
                ...dispatcherOption,
                lookup: clientOptions.lookup,
                checkAddress: clientOptions.checkAddress,
                connect: clientOptions.connect,
                allowH2: clientOptions.allowH2,
            };
            dispatcherClazz = HttpAgent;
        }
        else if (clientOptions?.connect) {
            dispatcherOption = {
                ...dispatcherOption,
                connect: clientOptions.connect,
                allowH2: clientOptions.allowH2,
            };
            dispatcherClazz = BaseAgent;
        }
        else if (clientOptions?.allowH2) {
            // Support HTTP2
            dispatcherOption = {
                ...dispatcherOption,
                allowH2: clientOptions.allowH2,
            };
            dispatcherClazz = BaseAgent;
        }
        FetchFactory.#dispatcher = new dispatcherClazz(dispatcherOption);
        initDiagnosticsChannel();
    }
    static getDispatcherPoolStats() {
        const agent = FetchFactory.getDispatcher();
        // origin => Pool Instance
        const clients = Reflect.get(agent, undiciSymbols.kClients);
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
        const request = new Request(input, init);
        const requestId = globalId('HttpClientRequest');
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
            [symbols.kRequestId]: requestId,
            [symbols.kRequestStartTime]: requestStartTime,
            [symbols.kEnableRequestTiming]: !!(init.timing ?? true),
            [symbols.kRequestTiming]: timing,
            // [symbols.kRequestOriginalOpaque]: originalOpaque,
        };
        const reqMeta = {
            requestId,
            url: request.url,
            args: {
                method: request.method,
                type: request.method,
                data: request.body,
                headers: convertHeader(request.headers),
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
        channels.request.publish({
            request: reqMeta,
        });
        channels.fetchRequest.publish({
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
                res = await UndiciFetch(request);
            });
        }
        catch (e) {
            updateSocketInfo(socketInfo, internalOpaque, e);
            urllibResponse.rt = performanceTime(requestStartTime);
            debug('Request#%d throw error: %s', requestId, e);
            channels.fetchResponse.publish({
                fetch: fetchMeta,
                error: e,
            });
            channels.response.publish({
                request: reqMeta,
                response: urllibResponse,
                error: e,
            });
            throw e;
        }
        // get undici internal response
        const state = getResponseState(res);
        updateSocketInfo(socketInfo, internalOpaque);
        urllibResponse.headers = convertHeader(res.headers);
        urllibResponse.status = urllibResponse.statusCode = res.status;
        urllibResponse.statusMessage = res.statusText;
        if (urllibResponse.headers['content-length']) {
            urllibResponse.size = parseInt(urllibResponse.headers['content-length']);
        }
        urllibResponse.rt = performanceTime(requestStartTime);
        debug('Request#%d got response, status: %s, headers: %j, timing: %j, socket: %j', requestId, urllibResponse.status, urllibResponse.headers, timing, urllibResponse.socket);
        channels.fetchResponse.publish({
            fetch: fetchMeta,
            timingInfo: state.timingInfo,
            response: res,
        });
        channels.response.publish({
            request: reqMeta,
            response: urllibResponse,
        });
        return res;
    }
}
export const fetch = FetchFactory.fetch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDckQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNyQyxPQUFPLEVBQ0wsS0FBSyxJQUFJLFdBQVcsRUFHcEIsT0FBTyxFQUdQLG1CQUFtQixHQUdwQixNQUFNLFFBQVEsQ0FBQztBQUNoQiw2REFBNkQ7QUFDN0QsYUFBYTtBQUNiLE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELDZEQUE2RDtBQUM3RCxhQUFhO0FBQ2IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDcEUsT0FBTyxFQUNMLFFBQVEsR0FNVCxNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFDTCxTQUFTLEdBRVYsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDeEYsT0FBTyxPQUFPLE1BQU0sY0FBYyxDQUFDO0FBU25DLE9BQU8sRUFBRSxTQUFTLEVBQW9CLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBa0J2QyxNQUFNLE9BQU8sWUFBWTtJQUN2QixNQUFNLENBQUMsV0FBVyxDQUFnQztJQUNsRCxNQUFNLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxpQkFBaUIsRUFBZSxDQUFDO0lBRWxFLE1BQU0sQ0FBQyxhQUFhO1FBQ2xCLE9BQU8sWUFBWSxDQUFDLFdBQVcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0lBQzNELENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQWlCO1FBQ3BDLFlBQVksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ3hDLENBQUM7SUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBNEI7UUFDbEQsSUFBSSxnQkFBZ0IsR0FBcUI7WUFDdkMsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLG1CQUFtQjtTQUNyRCxDQUFDO1FBQ0YsSUFBSSxlQUFlLEdBQWlELFNBQVMsQ0FBQztRQUM5RSxJQUFJLGFBQWEsRUFBRSxNQUFNLElBQUksYUFBYSxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQ3pELGdCQUFnQixHQUFHO2dCQUNqQixHQUFHLGdCQUFnQjtnQkFDbkIsTUFBTSxFQUFFLGFBQWEsQ0FBQyxNQUFNO2dCQUM1QixZQUFZLEVBQUUsYUFBYSxDQUFDLFlBQVk7Z0JBQ3hDLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTztnQkFDOUIsT0FBTyxFQUFFLGFBQWEsQ0FBQyxPQUFPO2FBQ1gsQ0FBQztZQUN0QixlQUFlLEdBQUcsU0FBb0UsQ0FBQztRQUN6RixDQUFDO2FBQU0sSUFBSSxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDbEMsZ0JBQWdCLEdBQUc7Z0JBQ2pCLEdBQUcsZ0JBQWdCO2dCQUNuQixPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU87Z0JBQzlCLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTzthQUNYLENBQUM7WUFDdEIsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUM5QixDQUFDO2FBQU0sSUFBSSxhQUFhLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDbEMsZ0JBQWdCO1lBQ2hCLGdCQUFnQixHQUFHO2dCQUNqQixHQUFHLGdCQUFnQjtnQkFDbkIsT0FBTyxFQUFFLGFBQWEsQ0FBQyxPQUFPO2FBQ1gsQ0FBQztZQUN0QixlQUFlLEdBQUcsU0FBUyxDQUFDO1FBQzlCLENBQUM7UUFDRCxZQUFZLENBQUMsV0FBVyxHQUFHLElBQUksZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDakUsc0JBQXNCLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsTUFBTSxDQUFDLHNCQUFzQjtRQUMzQixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDM0MsMEJBQTBCO1FBQzFCLE1BQU0sT0FBTyxHQUEyQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkcsTUFBTSxZQUFZLEdBQTZCLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixPQUFPLFlBQVksQ0FBQztRQUN0QixDQUFDO1FBQ0QsS0FBSyxNQUFNLENBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFHLE9BQU8sR0FBRyxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBc0IsQ0FBQztZQUNwRixNQUFNLEtBQUssR0FBRyxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLO2dCQUFFLFNBQVM7WUFDckIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHO2dCQUNsQixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7Z0JBQzFCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUN0QixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07Z0JBQ3BCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2FBQ0UsQ0FBQztRQUN2QixDQUFDO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQWtCLEVBQUUsSUFBd0I7UUFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDM0MsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQyxXQUFXLENBQUM7UUFDOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2hELHVHQUF1RztRQUN2RyxNQUFNLE1BQU0sR0FBRztZQUNiLGtCQUFrQjtZQUNsQixPQUFPLEVBQUUsQ0FBQztZQUNWLGtCQUFrQjtZQUNsQixTQUFTLEVBQUUsQ0FBQztZQUNaLG1CQUFtQjtZQUNuQixTQUFTLEVBQUUsQ0FBQztZQUNaLHVCQUF1QjtZQUN2QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLDJDQUEyQztZQUMzQyxXQUFXLEVBQUUsQ0FBQztZQUNkLHFFQUFxRTtZQUNyRSxPQUFPLEVBQUUsQ0FBQztZQUNWLG9EQUFvRDtZQUNwRCxlQUFlLEVBQUUsQ0FBQztTQUNuQixDQUFDO1FBRUYsa0VBQWtFO1FBQ2xFLE1BQU0sY0FBYyxHQUFHO1lBQ3JCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFNBQVM7WUFDL0IsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRSxnQkFBZ0I7WUFDN0MsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztZQUN2RCxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxNQUFNO1lBQ2hDLG9EQUFvRDtTQUN0QyxDQUFDO1FBQ2pCLE1BQU0sT0FBTyxHQUFnQjtZQUMzQixTQUFTO1lBQ1QsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHO1lBQ2hCLElBQUksRUFBRTtnQkFDSixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQW9CO2dCQUNwQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQW9CO2dCQUNsQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7Z0JBQ2xCLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQzthQUN4QztZQUNELE9BQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQztRQUNGLE1BQU0sU0FBUyxHQUFjO1lBQzNCLFNBQVM7WUFDVCxPQUFPO1NBQ1IsQ0FBQztRQUNGLE1BQU0sVUFBVSxHQUFlO1lBQzdCLEVBQUUsRUFBRSxDQUFDO1lBQ0wsWUFBWSxFQUFFLEVBQUU7WUFDaEIsU0FBUyxFQUFFLENBQUM7WUFDWixhQUFhLEVBQUUsRUFBRTtZQUNqQixVQUFVLEVBQUUsQ0FBQztZQUNiLFlBQVksRUFBRSxFQUFFO1lBQ2hCLFlBQVksRUFBRSxDQUFDO1lBQ2YsU0FBUyxFQUFFLENBQUM7WUFDWixlQUFlLEVBQUUsQ0FBQztZQUNsQixnQkFBZ0IsRUFBRSxDQUFDO1NBQ3BCLENBQUM7UUFDRixRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUN2QixPQUFPLEVBQUUsT0FBTztTQUNZLENBQUMsQ0FBQztRQUNoQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztZQUM1QixLQUFLLEVBQUUsU0FBUztTQUNVLENBQUMsQ0FBQztRQUU5QixJQUFJLEdBQWEsQ0FBQztRQUNsQiwyQ0FBMkM7UUFDM0MsTUFBTSxVQUFVLEdBQXdCLEVBQUUsQ0FBQztRQUMzQyxNQUFNLGNBQWMsR0FBRztZQUNyQixNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ1YsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUNkLFVBQVUsRUFBRSxFQUFFO1lBQ2QsYUFBYSxFQUFFLEVBQUU7WUFDakIsT0FBTyxFQUFFLFVBQVU7WUFDbkIsSUFBSSxFQUFFLENBQUM7WUFDUCxPQUFPLEVBQUUsS0FBSztZQUNkLEVBQUUsRUFBRSxDQUFDO1lBQ0wsZUFBZSxFQUFFLElBQUk7WUFDckIsV0FBVyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxHQUFHO2FBQ1o7WUFDRCxNQUFNO1lBQ04sTUFBTSxFQUFFLFVBQVU7WUFDbEIsT0FBTyxFQUFFLENBQUM7WUFDVixrQkFBa0IsRUFBRSxDQUFDO1NBQ1EsQ0FBQztRQUNoQyxJQUFJLENBQUM7WUFDSCxNQUFNLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwRSxHQUFHLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztZQUNoQixnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELGNBQWMsQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdEQsS0FBSyxDQUFDLDRCQUE0QixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFDN0IsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDO2FBQzBCLENBQUMsQ0FBQztZQUN0QyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDeEIsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixLQUFLLEVBQUUsQ0FBQzthQUNxQixDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLENBQUM7UUFDVixDQUFDO1FBRUQsK0JBQStCO1FBQy9CLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLEdBQUksQ0FBQyxDQUFDO1FBQ3JDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU3QyxjQUFjLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxHQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsY0FBYyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsVUFBVSxHQUFHLEdBQUksQ0FBQyxNQUFNLENBQUM7UUFDaEUsY0FBZSxDQUFDLGFBQWEsR0FBRyxHQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2hELElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDN0MsY0FBYyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUNELGNBQWMsQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsS0FBSyxDQUFDLDBFQUEwRSxFQUM5RSxTQUFTLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0YsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDN0IsS0FBSyxFQUFFLFNBQVM7WUFDaEIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO1lBQzVCLFFBQVEsRUFBRSxHQUFJO1NBQ29CLENBQUMsQ0FBQztRQUN0QyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUN4QixPQUFPLEVBQUUsT0FBTztZQUNoQixRQUFRLEVBQUUsY0FBYztTQUNLLENBQUMsQ0FBQztRQUNqQyxPQUFPLEdBQUksQ0FBQztJQUNkLENBQUM7O0FBR0gsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMifQ==