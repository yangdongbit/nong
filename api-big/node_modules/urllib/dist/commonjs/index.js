"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebFormData = exports.FetchFactory = exports.USER_AGENT = exports.HttpClient2 = exports.HttpClient = exports.FormData = exports.Headers = exports.Response = exports.Request = exports.getGlobalDispatcher = exports.setGlobalDispatcher = exports.Dispatcher = exports.Agent = exports.ProxyAgent = exports.MockAgent = void 0;
exports.getDefaultHttpClient = getDefaultHttpClient;
exports.request = request;
exports.curl = curl;
const ylru_1 = require("ylru");
const utils_js_1 = require("./utils.js");
(0, utils_js_1.patchForNode16)();
const HttpClient_js_1 = require("./HttpClient.js");
let httpClient;
let allowH2HttpClient;
let allowUnauthorizedHttpClient;
let allowH2AndUnauthorizedHttpClient;
const domainSocketHttpClients = new ylru_1.LRU(50);
function getDefaultHttpClient(rejectUnauthorized, allowH2) {
    if (rejectUnauthorized === false) {
        if (allowH2) {
            if (!allowH2AndUnauthorizedHttpClient) {
                allowH2AndUnauthorizedHttpClient = new HttpClient_js_1.HttpClient({
                    allowH2,
                    connect: {
                        rejectUnauthorized,
                    },
                });
            }
            return allowH2AndUnauthorizedHttpClient;
        }
        if (!allowUnauthorizedHttpClient) {
            allowUnauthorizedHttpClient = new HttpClient_js_1.HttpClient({
                connect: {
                    rejectUnauthorized,
                },
            });
        }
        return allowUnauthorizedHttpClient;
    }
    if (allowH2) {
        if (!allowH2HttpClient) {
            allowH2HttpClient = new HttpClient_js_1.HttpClient({
                allowH2,
            });
        }
        return allowH2HttpClient;
    }
    if (!httpClient) {
        httpClient = new HttpClient_js_1.HttpClient();
    }
    return httpClient;
}
async function request(url, options) {
    if (options?.socketPath) {
        let domainSocketHttpclient = domainSocketHttpClients.get(options.socketPath);
        if (!domainSocketHttpclient) {
            domainSocketHttpclient = new HttpClient_js_1.HttpClient({
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
async function curl(url, options) {
    return await request(url, options);
}
var undici_1 = require("undici");
Object.defineProperty(exports, "MockAgent", { enumerable: true, get: function () { return undici_1.MockAgent; } });
Object.defineProperty(exports, "ProxyAgent", { enumerable: true, get: function () { return undici_1.ProxyAgent; } });
Object.defineProperty(exports, "Agent", { enumerable: true, get: function () { return undici_1.Agent; } });
Object.defineProperty(exports, "Dispatcher", { enumerable: true, get: function () { return undici_1.Dispatcher; } });
Object.defineProperty(exports, "setGlobalDispatcher", { enumerable: true, get: function () { return undici_1.setGlobalDispatcher; } });
Object.defineProperty(exports, "getGlobalDispatcher", { enumerable: true, get: function () { return undici_1.getGlobalDispatcher; } });
Object.defineProperty(exports, "Request", { enumerable: true, get: function () { return undici_1.Request; } });
Object.defineProperty(exports, "Response", { enumerable: true, get: function () { return undici_1.Response; } });
Object.defineProperty(exports, "Headers", { enumerable: true, get: function () { return undici_1.Headers; } });
Object.defineProperty(exports, "FormData", { enumerable: true, get: function () { return undici_1.FormData; } });
// HttpClient2 is keep compatible with urllib@2 HttpClient2
var HttpClient_js_2 = require("./HttpClient.js");
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return HttpClient_js_2.HttpClient; } });
Object.defineProperty(exports, "HttpClient2", { enumerable: true, get: function () { return HttpClient_js_2.HttpClient; } });
Object.defineProperty(exports, "USER_AGENT", { enumerable: true, get: function () { return HttpClient_js_2.HEADER_USER_AGENT; } });
__exportStar(require("./HttpClientError.js"), exports);
var fetch_js_1 = require("./fetch.js");
Object.defineProperty(exports, "FetchFactory", { enumerable: true, get: function () { return fetch_js_1.FetchFactory; } });
Object.defineProperty(exports, "fetch", { enumerable: true, get: function () { return fetch_js_1.fetch; } });
var FormData_js_1 = require("./FormData.js");
Object.defineProperty(exports, "WebFormData", { enumerable: true, get: function () { return FormData_js_1.FormData; } });
exports.default = {
    request,
    curl,
    USER_AGENT: HttpClient_js_1.HEADER_USER_AGENT,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjQSxvREFxQ0M7QUFhRCwwQkFhQztBQU9ELG9CQUVDO0FBdEZELCtCQUEyQjtBQUMzQix5Q0FBNEM7QUFFNUMsSUFBQSx5QkFBYyxHQUFFLENBQUM7QUFFakIsbURBQWdFO0FBR2hFLElBQUksVUFBc0IsQ0FBQztBQUMzQixJQUFJLGlCQUE2QixDQUFDO0FBQ2xDLElBQUksMkJBQXVDLENBQUM7QUFDNUMsSUFBSSxnQ0FBNEMsQ0FBQztBQUNqRCxNQUFNLHVCQUF1QixHQUFHLElBQUksVUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTVDLFNBQWdCLG9CQUFvQixDQUFDLGtCQUE0QixFQUFFLE9BQWlCO0lBQ2xGLElBQUksa0JBQWtCLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDakMsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO2dCQUN0QyxnQ0FBZ0MsR0FBRyxJQUFJLDBCQUFVLENBQUM7b0JBQ2hELE9BQU87b0JBQ1AsT0FBTyxFQUFFO3dCQUNQLGtCQUFrQjtxQkFDbkI7aUJBQ0YsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sZ0NBQWdDLENBQUM7UUFDMUMsQ0FBQztRQUVELElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ2pDLDJCQUEyQixHQUFHLElBQUksMEJBQVUsQ0FBQztnQkFDM0MsT0FBTyxFQUFFO29CQUNQLGtCQUFrQjtpQkFDbkI7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTywyQkFBMkIsQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZCLGlCQUFpQixHQUFHLElBQUksMEJBQVUsQ0FBQztnQkFDakMsT0FBTzthQUNSLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEIsVUFBVSxHQUFHLElBQUksMEJBQVUsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBYU0sS0FBSyxVQUFVLE9BQU8sQ0FBVSxHQUFlLEVBQUUsT0FBOEI7SUFDcEYsSUFBSSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7UUFDeEIsSUFBSSxzQkFBc0IsR0FBRyx1QkFBdUIsQ0FBQyxHQUFHLENBQWEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pGLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzVCLHNCQUFzQixHQUFHLElBQUksMEJBQVUsQ0FBQztnQkFDdEMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUU7YUFDNUMsQ0FBQyxDQUFDO1lBQ0gsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsT0FBTyxNQUFNLHNCQUFzQixDQUFDLE9BQU8sQ0FBSSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELE9BQU8sTUFBTSxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBSSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDNUcsQ0FBQztBQUVELDJEQUEyRDtBQUMzRCxRQUFRO0FBQ1Isb0NBQW9DO0FBQ3BDLG9CQUFvQjtBQUNwQixNQUFNO0FBQ0MsS0FBSyxVQUFVLElBQUksQ0FBVSxHQUFlLEVBQUUsT0FBOEI7SUFDakYsT0FBTyxNQUFNLE9BQU8sQ0FBSSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVELGlDQU1nQjtBQUxkLG1HQUFBLFNBQVMsT0FBQTtBQUFFLG9HQUFBLFVBQVUsT0FBQTtBQUFFLCtGQUFBLEtBQUssT0FBQTtBQUFFLG9HQUFBLFVBQVUsT0FBQTtBQUN4Qyw2R0FBQSxtQkFBbUIsT0FBQTtBQUFFLDZHQUFBLG1CQUFtQixPQUFBO0FBQ3hDLGlHQUFBLE9BQU8sT0FBQTtBQUNQLGtHQUFBLFFBQVEsT0FBQTtBQUNSLGlHQUFBLE9BQU8sT0FBQTtBQUFFLGtHQUFBLFFBQVEsT0FBQTtBQUVuQiwyREFBMkQ7QUFDM0QsaURBR3lCO0FBRnZCLDJHQUFBLFVBQVUsT0FBQTtBQUFFLDRHQUFBLFVBQVUsT0FBZTtBQUFFLDJHQUFBLGlCQUFpQixPQUFjO0FBaUJ4RSx1REFBcUM7QUFDckMsdUNBQWlEO0FBQXhDLHdHQUFBLFlBQVksT0FBQTtBQUFFLGlHQUFBLEtBQUssT0FBQTtBQUM1Qiw2Q0FBd0Q7QUFBL0MsMEdBQUEsUUFBUSxPQUFlO0FBRWhDLGtCQUFlO0lBQ2IsT0FBTztJQUNQLElBQUk7SUFDSixVQUFVLEVBQUUsaUNBQWlCO0NBQzlCLENBQUMifQ==