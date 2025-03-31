"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormData = void 0;
const node_path_1 = __importDefault(require("node:path"));
const form_data_1 = __importDefault(require("form-data"));
// eslint-disable-next-line
const NON_ASCII_RE = /[^\x00-\x7F]/i;
class FormData extends form_data_1.default {
    _getContentDisposition(value, options) {
        // support non-ascii filename
        // https://github.com/form-data/form-data/pull/571
        let filename;
        let contentDisposition;
        if (typeof options.filepath === 'string') {
            // custom filepath for relative paths
            filename = node_path_1.default.normalize(options.filepath).replace(/\\/g, '/');
        }
        else if (options.filename || value.name || value.path) {
            // custom filename take precedence
            // formidable and the browser add a name property
            // fs- and request- streams have path property
            filename = node_path_1.default.basename(options.filename || value.name || value.path);
        }
        else if (value.readable && value.hasOwnProperty('httpVersion')) {
            // or try http response
            filename = node_path_1.default.basename(value.client._httpMessage.path || '');
        }
        if (filename) {
            // https://datatracker.ietf.org/doc/html/rfc6266#section-4.1
            // support non-ascii filename
            contentDisposition = 'filename="' + filename + '"';
            if (NON_ASCII_RE.test(filename)) {
                contentDisposition += '; filename*=UTF-8\'\'' + encodeURIComponent(filename);
            }
        }
        return contentDisposition;
    }
}
exports.FormData = FormData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRm9ybURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMERBQTZCO0FBQzdCLDBEQUFrQztBQUVsQywyQkFBMkI7QUFDM0IsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDO0FBRXJDLE1BQWEsUUFBUyxTQUFRLG1CQUFTO0lBQ3JDLHNCQUFzQixDQUFDLEtBQVUsRUFBRSxPQUFZO1FBQzdDLDZCQUE2QjtRQUM3QixrREFBa0Q7UUFDbEQsSUFBSSxRQUFRLENBQUM7UUFDYixJQUFJLGtCQUFrQixDQUFDO1FBRXZCLElBQUksT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3pDLHFDQUFxQztZQUNyQyxRQUFRLEdBQUcsbUJBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQzthQUFNLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4RCxrQ0FBa0M7WUFDbEMsaURBQWlEO1lBQ2pELDhDQUE4QztZQUM5QyxRQUFRLEdBQUcsbUJBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RSxDQUFDO2FBQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztZQUNqRSx1QkFBdUI7WUFDdkIsUUFBUSxHQUFHLG1CQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLDREQUE0RDtZQUM1RCw2QkFBNkI7WUFDN0Isa0JBQWtCLEdBQUcsWUFBWSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUM7WUFDbkQsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLGtCQUFrQixJQUFJLHVCQUF1QixHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9FLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxrQkFBa0IsQ0FBQztJQUM1QixDQUFDO0NBQ0Y7QUEvQkQsNEJBK0JDIn0=