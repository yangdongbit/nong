"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = hash;
exports.md5 = md5;
exports.sha1 = sha1;
exports.sha256 = sha256;
exports.sha512 = sha512;
exports.hmac = hmac;
exports.base64encode = base64encode;
exports.base64decode = base64decode;
const node_crypto_1 = require("node:crypto");
const node_crypto_2 = __importDefault(require("node:crypto"));
const nativeHash = 'hash' in node_crypto_2.default ? node_crypto_2.default.hash : null;
/**
 * hash
 *
 * @param {String} method hash method, e.g.: 'md5', 'sha1'
 * @param {String|Buffer|ArrayBuffer|TypedArray|DataView|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
function hash(method, s, format) {
    if (s instanceof ArrayBuffer) {
        s = Buffer.from(s);
    }
    const isBuffer = Buffer.isBuffer(s) || ArrayBuffer.isView(s);
    if (!isBuffer && typeof s === 'object') {
        s = JSON.stringify(sortObject(s));
    }
    if (nativeHash) {
        // try to use crypto.hash first
        // https://nodejs.org/en/blog/release/v21.7.0#crypto-implement-cryptohash
        return nativeHash(method, s, format);
    }
    const sum = (0, node_crypto_1.createHash)(method);
    sum.update(s, isBuffer ? 'binary' : 'utf8');
    return sum.digest(format || 'hex');
}
/**
 * md5 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
function md5(s, format) {
    return hash('md5', s, format);
}
/**
 * sha1 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha1 hash string
 * @public
 */
function sha1(s, format) {
    return hash('sha1', s, format);
}
/**
 * sha256 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha256 hash string
 * @public
 */
function sha256(s, format) {
    return hash('sha256', s, format);
}
/**
 * sha512 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha512 hash string
 * @public
 */
function sha512(s, format) {
    return hash('sha512', s, format);
}
/**
 * HMAC algorithm.
 *
 * Equal bash:
 *
 * ```bash
 * $ echo -n "$data" | openssl dgst -binary -$algorithm -hmac "$key" | openssl $encoding
 * ```
 *
 * @param {String} algorithm dependent on the available algorithms supported by the version of OpenSSL on the platform.
 *   Examples are 'sha1', 'md5', 'sha256', 'sha512', etc.
 *   On recent releases, `openssl list-message-digest-algorithms` will display the available digest algorithms.
 * @param {String} key the hmac key to be used.
 * @param {String|Buffer} data content string.
 * @param {String} [encoding='base64'] default encoding is base64
 * @return {String} digest string.
 */
function hmac(algorithm, key, data, encoding) {
    encoding = encoding || 'base64';
    const hmac = (0, node_crypto_1.createHmac)(algorithm, key);
    hmac.update(data, Buffer.isBuffer(data) ? 'binary' : 'utf8');
    return hmac.digest(encoding);
}
/**
 * Base64 encode string.
 *
 * @param {String|Buffer} s input value
 * @param {Boolean} [urlSafe=false] Encode string s using a URL-safe alphabet,
 *   which substitutes - instead of + and _ instead of / in the standard Base64 alphabet.
 * @return {String} base64 encode format string.
 */
function base64encode(s, urlSafe) {
    if (!Buffer.isBuffer(s)) {
        s = Buffer.from(s);
    }
    let encode = s.toString('base64');
    if (urlSafe) {
        encode = encode.replace(/\+/g, '-').replace(/\//g, '_');
    }
    return encode;
}
/**
 * Base64 string decode.
 *
 * @param {String} encodeStr base64 encoding string.
 * @param {Boolean} [urlSafe=false] Decode string s using a URL-safe alphabet,
 *   which substitutes - instead of + and _ instead of / in the standard Base64 alphabet.
 * @param {encoding} [encoding=utf8] if encoding = buffer, will return Buffer instance
 * @return {String|Buffer} plain text.
 */
function base64decode(encodeStr, urlSafe, encoding) {
    if (urlSafe) {
        encodeStr = encodeStr.replace(/\-/g, '+').replace(/_/g, '/');
    }
    const buf = Buffer.from(encodeStr, 'base64');
    if (encoding === 'buffer') {
        return buf;
    }
    return buf.toString(encoding || 'utf8');
}
function sortObject(o) {
    if (!o || Array.isArray(o) || typeof o !== 'object') {
        return o;
    }
    const keys = Object.keys(o);
    keys.sort();
    const values = [];
    for (const k of keys) {
        values.push([k, sortObject(o[k])]);
    }
    return values;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NyeXB0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQWlCQSxvQkFrQkM7QUFVRCxrQkFFQztBQVVELG9CQUVDO0FBVUQsd0JBRUM7QUFVRCx3QkFFQztBQW1CRCxvQkFLQztBQVVELG9DQVNDO0FBV0Qsb0NBU0M7QUFsSkQsNkNBQTJFO0FBQzNFLDhEQUFpQztBQUtqQyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUkscUJBQU0sQ0FBQyxDQUFDLENBQUMscUJBQU0sQ0FBQyxJQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFFdkU7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQixJQUFJLENBQUMsTUFBYyxFQUFFLENBQVksRUFBRSxNQUE2QjtJQUM5RSxJQUFJLENBQUMsWUFBWSxXQUFXLEVBQUUsQ0FBQztRQUM3QixDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDdkMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQUksVUFBVSxFQUFFLENBQUM7UUFDZiwrQkFBK0I7UUFDL0IseUVBQXlFO1FBQ3pFLE9BQU8sVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELE1BQU0sR0FBRyxHQUFHLElBQUEsd0JBQVUsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixHQUFHLENBQUMsTUFBTSxDQUFD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