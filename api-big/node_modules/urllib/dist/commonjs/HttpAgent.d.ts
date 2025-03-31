import { LookupFunction } from 'node:net';
import { Agent, Dispatcher, buildConnector } from 'undici';
import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
export type CheckAddressFunction = (ip: string, family: number | string, hostname: string) => boolean;
export interface HttpAgentOptions extends BaseAgentOptions {
    lookup?: LookupFunction;
    checkAddress?: CheckAddressFunction;
    connect?: buildConnector.BuildOptions;
    allowH2?: boolean;
}
export declare class HttpAgent extends BaseAgent {
    #private;
    constructor(options: HttpAgentOptions);
    dispatch(options: Agent.DispatchOptions, handler: Dispatcher.DispatchHandler): boolean;
}
