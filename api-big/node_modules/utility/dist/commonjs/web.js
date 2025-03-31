"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escape = escape;
exports.unescape = unescape;
exports.encodeURIComponent = encodeURIComponent;
exports.decodeURIComponent = decodeURIComponent;
const escape_html_1 = __importDefault(require("escape-html"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const unescape_1 = __importDefault(require("unescape"));
/**
 * Escape the given string of `html`.
 *
 * @param {String} html the html need to escape
 * @return {String} escape html
 * @public
 */
function escape(html) {
    return (0, escape_html_1.default)(html);
}
/**
 * Unescape the given string from html
 * @public
 */
function unescape(html, type) {
    return (0, unescape_1.default)(html, type);
}
/**
 * Safe encodeURIComponent, won't throw any error.
 * If `encodeURIComponent` error happen, just return the original value.
 *
 * @param {String} text input text
 * @return {String} URL encode string.
 */
function encodeURIComponent(text) {
    try {
        return global.encodeURIComponent(text);
    }
    catch {
        return text;
    }
}
/**
 * Safe decodeURIComponent, won't throw any error.
 * If `decodeURIComponent` error happen, just return the original value.
 *
 * @param {String} encodeText encode text
 * @return {String} URL decode original string.
 */
function decodeURIComponent(encodeText) {
    try {
        return global.decodeURIComponent(encodeText);
    }
    catch {
        return encodeText;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3dlYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQVlBLHdCQUVDO0FBTUQsNEJBRUM7QUFTRCxnREFNQztBQVNELGdEQU1DO0FBcERELDhEQUFxQztBQUNyQyw2REFBNkQ7QUFDN0QsYUFBYTtBQUNiLHdEQUFpQztBQUVqQzs7Ozs7O0dBTUc7QUFDSCxTQUFnQixNQUFNLENBQUMsSUFBWTtJQUNqQyxPQUFPLElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLElBQVksRUFBRSxJQUFhO0lBQ2xELE9BQU8sSUFBQSxrQkFBUyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWTtJQUM3QyxJQUFJLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ1AsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLGtCQUFrQixDQUFDLFVBQWtCO0lBQ25ELElBQUksQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFBQyxNQUFNLENBQUM7UUFDUCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0FBQ0gsQ0FBQyJ9