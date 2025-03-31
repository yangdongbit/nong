import { RequestInfo, RequestInit, Response, Agent, Dispatcher } from 'undici';
import { ClientOptions, PoolStat, UndiciTimingInfo } from './HttpClient.js';
import { FetchMeta } from './Request.js';
export interface UrllibRequestInit extends RequestInit {
    timing?: boolean;
}
export type FetchDiagnosticsMessage = {
    fetch: FetchMeta;
};
export type FetchResponseDiagnosticsMessage = {
    fetch: FetchMeta;
    timingInfo?: UndiciTimingInfo;
    response?: Response;
    error?: Error;
};
export declare class FetchFactory {
    #private;
    static getDispatcher(): Dispatcher.ComposedDispatcher;
    static setDispatcher(dispatcher: Agent): void;
    static setClientOptions(clientOptions: ClientOptions): void;
    static getDispatcherPoolStats(): Record<string, PoolStat>;
    static fetch(input: RequestInfo, init?: UrllibRequestInit): Promise<Response>;
}
export declare const fetch: typeof FetchFactory.fetch;
