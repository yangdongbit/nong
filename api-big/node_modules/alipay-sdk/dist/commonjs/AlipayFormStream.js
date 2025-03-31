"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlipayFormStream = void 0;
const formstream_1 = __importDefault(require("formstream"));
class AlipayFormStream extends formstream_1.default {
    constructor(options) {
        super({
            // set default minChunkSize to 2MB
            minChunkSize: 1024 * 1024 * 2,
            ...options,
        });
    }
}
exports.AlipayFormStream = AlipayFormStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxpcGF5Rm9ybVN0cmVhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9BbGlwYXlGb3JtU3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDREQUFvQztBQU9wQyxNQUFhLGdCQUFpQixTQUFRLG9CQUFVO0lBQzlDLFlBQVksT0FBaUM7UUFDM0MsS0FBSyxDQUFDO1lBQ0osa0NBQWtDO1lBQ2xDLFlBQVksRUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDN0IsR0FBRyxPQUFPO1NBQ1gsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBUkQsNENBUUMifQ==