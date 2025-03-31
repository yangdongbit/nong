import { BinaryToTextEncoding } from 'node:crypto';
type HashInput = string | Buffer | ArrayBuffer | DataView | object;
/**
 * hash
 *
 * @param {String} method hash method, e.g.: 'md5', 'sha1'
 * @param {String|Buffer|ArrayBuffer|TypedArray|DataView|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
export declare function hash(method: string, s: HashInput, format?: BinaryToTextEncoding): string;
/**
 * md5 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
export declare function md5(s: HashInput, format?: BinaryToTextEncoding): string;
/**
 * sha1 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha1 hash string
 * @public
 */
export declare function sha1(s: HashInput, format?: BinaryToTextEncoding): string;
/**
 * sha256 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha256 hash string
 * @public
 */
export declare function sha256(s: HashInput, format?: BinaryToTextEncoding): string;
/**
 * sha512 hash
 *
 * @param {String|Buffer|Object} s input value
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha512 hash string
 * @public
 */
export declare function sha512(s: HashInput, format?: BinaryToTextEncoding): string;
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
export declare function hmac(algorithm: string, key: string, data: string | Buffer, encoding?: BinaryToTextEncoding): string;
/**
 * Base64 encode string.
 *
 * @param {String|Buffer} s input value
 * @param {Boolean} [urlSafe=false] Encode string s using a URL-safe alphabet,
 *   which substitutes - instead of + and _ instead of / in the standard Base64 alphabet.
 * @return {String} base64 encode format string.
 */
export declare function base64encode(s: string | Buffer, urlSafe?: boolean): string;
/**
 * Base64 string decode.
 *
 * @param {String} encodeStr base64 encoding string.
 * @param {Boolean} [urlSafe=false] Decode string s using a URL-safe alphabet,
 *   which substitutes - instead of + and _ instead of / in the standard Base64 alphabet.
 * @param {encoding} [encoding=utf8] if encoding = buffer, will return Buffer instance
 * @return {String|Buffer} plain text.
 */
export declare function base64decode(encodeStr: string, urlSafe?: boolean, encoding?: BufferEncoding | 'buffer'): string | Buffer;
export {};
