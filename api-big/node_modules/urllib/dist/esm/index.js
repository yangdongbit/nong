import { LRU } from 'ylru';
import { patchForNode16 } from './utils.js';
patchForNode16();
import { HttpClient, HEADER_USER_AGENT } from './HttpClient.js';
let httpClient;
let allowH2HttpClient;
let allowUnauthorizedHttpClient;
let allowH2AndUnauthorizedHttpClient;
const domainSocketHttpClients = new LRU(50);
export function getDefaultHttpClient(rejectUnauthorized, allowH2) {
    if (rejectUnauthorized === false) {
        if (allowH2) {
            if (!allowH2AndUnauthorizedHttpClient) {
                allowH2AndUnauthorizedHttpClient = new HttpClient({
                    allowH2,
                    connect: {
                        rejectUnauthorized,
                    },
                });
            }
            return allowH2AndUnauthorizedHttpClient;
        }
        if (!allowUnauthorizedHttpClient) {
            allowUnauthorizedHttpClient = new HttpClient({
                connect: {
                    rejectUnauthorized,
                },
            });
        }
        return allowUnauthorizedHttpClient;
    }
    if (allowH2) {
        if (!allowH2HttpClient) {
            allowH2HttpClient = new HttpClient({
                allowH2,
            });
        }
        return allowH2HttpClient;
    }
    if (!httpClient) {
        httpClient = new HttpClient();
    }
    return httpClient;
}
export async function request(url, options) {
    if (options?.socketPath) {
        let domainSocketHttpclient = domainSocketHttpClients.get(options.socketPath);
        if (!domainSocketHttpclient) {
            domainSocketHttpclient = new HttpClient({
                connect: { socketPath: options.socketPath },
            });
            domainSocketHttpClients.set(options.socketPath, domainSocketHttpclient);
        }
        return await domainSocketHttpclient.request(url, options);
    }
    return await getDefaultHttpClient(options?.rejectUnauthorized, options?.allowH2).request(url, options);
}
// export curl method is keep compatible with urllib.curl()
// ```ts
// import * as urllib from 'urllib';
// urllib.curl(url);
// ```
export async function curl(url, options) {
    return await request(url, options);
}
export { MockAgent, ProxyAgent, Agent, Dispatcher, setGlobalDispatcher, getGlobalDispatcher, Request, Response, Headers, FormData, } from 'undici';
// HttpClient2 is keep compatible with urllib@2 HttpClient2
export { HttpClient, HttpClient as HttpClient2, HEADER_USER_AGENT as USER_AGENT, } from './HttpClient.js';
export * from './HttpClientError.js';
export { FetchFactory, fetch } from './fetch.js';
export { FormData as WebFormData } from './FormData.js';
export default {
    request,
    curl,
    USER_AGENT: HEADER_USER_AGENT,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTVDLGNBQWMsRUFBRSxDQUFDO0FBRWpCLE9BQU8sRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUdoRSxJQUFJLFVBQXNCLENBQUM7QUFDM0IsSUFBSSxpQkFBNkIsQ0FBQztBQUNsQyxJQUFJLDJCQUF1QyxDQUFDO0FBQzVDLElBQUksZ0NBQTRDLENBQUM7QUFDakQsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUU1QyxNQUFNLFVBQVUsb0JBQW9CLENBQUMsa0JBQTRCLEVBQUUsT0FBaUI7SUFDbEYsSUFBSSxrQkFBa0IsS0FBSyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7Z0JBQ3RDLGdDQUFnQyxHQUFHLElBQUksVUFBVSxDQUFDO29CQUNoRCxPQUFPO29CQUNQLE9BQU8sRUFBRTt3QkFDUCxrQkFBa0I7cUJBQ25CO2lCQUNGLENBQUMsQ0FBQztZQUNMLENBQUM7WUFDRCxPQUFPLGdDQUFnQyxDQUFDO1FBQzFDLENBQUM7UUFFRCxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztZQUNqQywyQkFBMkIsR0FBRyxJQUFJLFVBQVUsQ0FBQztnQkFDM0MsT0FBTyxFQUFFO29CQUNQLGtCQUFrQjtpQkFDbkI7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTywyQkFBMkIsQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZCLGlCQUFpQixHQUFHLElBQUksVUFBVSxDQUFDO2dCQUNqQyxPQUFPO2FBQ1IsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8saUJBQWlCLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQixVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQWFELE1BQU0sQ0FBQyxLQUFLLFVBQVUsT0FBTyxDQUFVLEdBQWUsRUFBRSxPQUE4QjtJQUNwRixJQUFJLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQztRQUN4QixJQUFJLHNCQUFzQixHQUFHLHVCQUF1QixDQUFDLEdBQUcsQ0FBYSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekYsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDNUIsc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUM7Z0JBQ3RDLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFO2FBQzVDLENBQUMsQ0FBQztZQUNILHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUNELE9BQU8sTUFBTSxzQkFBc0IsQ0FBQyxPQUFPLENBQUksR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxPQUFPLE1BQU0sb0JBQW9CLENBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUksR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzVHLENBQUM7QUFFRCwyREFBMkQ7QUFDM0QsUUFBUTtBQUNSLG9DQUFvQztBQUNwQyxvQkFBb0I7QUFDcEIsTUFBTTtBQUNOLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFVLEdBQWUsRUFBRSxPQUE4QjtJQUNqRixPQUFPLE1BQU0sT0FBTyxDQUFJLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBRUQsT0FBTyxFQUNMLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFDeEMsbUJBQW1CLEVBQUUsbUJBQW1CLEVBQ3hDLE9BQU8sRUFDUCxRQUFRLEVBQ1IsT0FBTyxFQUFFLFFBQVEsR0FDbEIsTUFBTSxRQUFRLENBQUM7QUFDaEIsMkRBQTJEO0FBQzNELE9BQU8sRUFDTCxVQUFVLEVBQUUsVUFBVSxJQUFJLFdBQVcsRUFBRSxpQkFBaUIsSUFBSSxVQUFVLEdBRXZFLE1BQU0saUJBQWlCLENBQUM7QUFlekIsY0FBYyxzQkFBc0IsQ0FBQztBQUNyQyxPQUFPLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxJQUFJLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV4RCxlQUFlO0lBQ2IsT0FBTztJQUNQLElBQUk7SUFDSixVQUFVLEVBQUUsaUJBQWlCO0NBQzlCLENBQUMifQ==