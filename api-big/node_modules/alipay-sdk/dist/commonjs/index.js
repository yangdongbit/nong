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
exports.AlipayFormStream = exports.AlipayFormData = exports.ProxyAgent = void 0;
var urllib_1 = require("urllib");
Object.defineProperty(exports, "ProxyAgent", { enumerable: true, get: function () { return urllib_1.ProxyAgent; } });
__exportStar(require("./types.js"), exports);
__exportStar(require("./alipay.js"), exports);
var form_js_1 = require("./form.js");
Object.defineProperty(exports, "AlipayFormData", { enumerable: true, get: function () { return form_js_1.AlipayFormData; } });
var AlipayFormStream_js_1 = require("./AlipayFormStream.js");
Object.defineProperty(exports, "AlipayFormStream", { enumerable: true, get: function () { return AlipayFormStream_js_1.AlipayFormStream; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBb0M7QUFBM0Isb0dBQUEsVUFBVSxPQUFBO0FBQ25CLDZDQUEyQjtBQUMzQiw4Q0FBNEI7QUFDNUIscUNBQTJDO0FBQWxDLHlHQUFBLGNBQWMsT0FBQTtBQUN2Qiw2REFBeUQ7QUFBaEQsdUhBQUEsZ0JBQWdCLE9BQUEifQ==