import { AsyncLocalStorage } from 'node:async_hooks';
export interface FetchOpaque {
}
export interface OpaqueInterceptorOptions {
    opaqueLocalStorage: AsyncLocalStorage<FetchOpaque>;
}
