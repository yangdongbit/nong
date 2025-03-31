import escapeHTML from 'escape-html';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import _unescape from 'unescape';
/**
 * Escape the given string of `html`.
 *
 * @param {String} html the html need to escape
 * @return {String} escape html
 * @public
 */
export function escape(html) {
    return escapeHTML(html);
}
/**
 * Unescape the given string from html
 * @public
 */
export function unescape(html, type) {
    return _unescape(html, type);
}
/**
 * Safe encodeURIComponent, won't throw any error.
 * If `encodeURIComponent` error happen, just return the original value.
 *
 * @param {String} text input text
 * @return {String} URL encode string.
 */
export function encodeURIComponent(text) {
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
export function decodeURIComponent(encodeText) {
    try {
        return global.decodeURIComponent(encodeText);
    }
    catch {
        return encodeText;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3dlYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFVBQVUsTUFBTSxhQUFhLENBQUM7QUFDckMsNkRBQTZEO0FBQzdELGFBQWE7QUFDYixPQUFPLFNBQVMsTUFBTSxVQUFVLENBQUM7QUFFakM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLE1BQU0sQ0FBQyxJQUFZO0lBQ2pDLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsUUFBUSxDQUFDLElBQVksRUFBRSxJQUFhO0lBQ2xELE9BQU8sU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQVk7SUFDN0MsSUFBSSxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsVUFBa0I7SUFDbkQsSUFBSSxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNQLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7QUFDSCxDQUFDIn0=