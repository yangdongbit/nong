"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALIPAY_ALGORITHM_MAPPING = void 0;
exports.aesEncryptText = aesEncryptText;
exports.aesDecryptText = aesDecryptText;
exports.aesEncrypt = aesEncrypt;
exports.aesDecrypt = aesDecrypt;
exports.sign = sign;
exports.signatureV3 = signatureV3;
exports.verifySignatureV3 = verifySignatureV3;
exports.createRequestId = createRequestId;
exports.readableToBytes = readableToBytes;
exports.decamelize = decamelize;
const node_util_1 = require("node:util");
const node_crypto_1 = require("node:crypto");
const utility_1 = require("utility");
const snakecase_keys_1 = __importDefault(require("snakecase-keys"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const debug = (0, node_util_1.debuglog)('alipay-sdk:util');
exports.ALIPAY_ALGORITHM_MAPPING = {
    RSA: 'RSA-SHA1',
    RSA2: 'RSA-SHA256',
};
// https://opendocs.alipay.com/common/02mse3#NodeJS%20%E8%A7%A3%E5%AF%86%E7%A4%BA%E4%BE%8B
// 初始向量的方法, 全部为0. 这里的写法适合于其它算法,针对AES算法的话,IV值一定是128位的(16字节)
// https://opendocs.alipay.com/open-v3/054l3e?pathHash=5d1dc939#%E8%AF%B7%E6%B1%82%E6%8A%A5%E6%96%87%E5%8A%A0%E5%AF%86
const IV = crypto_js_1.default.enc.Hex.parse('00000000000000000000000000000000');
function parseKey(aesKey) {
    return {
        iv: IV,
        key: crypto_js_1.default.enc.Base64.parse(aesKey),
    };
}
function aesEncryptText(plainText, aesKey) {
    const { iv, key } = parseKey(aesKey);
    const encryptedText = crypto_js_1.default.AES.encrypt(plainText, key, { iv }).toString();
    return encryptedText;
}
function aesDecryptText(encryptedText, aesKey) {
    const { iv, key } = parseKey(aesKey);
    const bytes = crypto_js_1.default.AES.decrypt(encryptedText, key, { iv });
    const plainText = bytes.toString(crypto_js_1.default.enc.Utf8);
    return plainText;
}
// 先加密后加签，aesKey 是支付宝开放平台返回的 base64 格式加密 key
function aesEncrypt(data, aesKey) {
    const plainText = JSON.stringify(data);
    return aesEncryptText(plainText, aesKey);
}
// 解密
function aesDecrypt(encryptedText, aesKey) {
    const plainText = aesDecryptText(encryptedText, aesKey);
    const decryptedData = JSON.parse(plainText);
    return decryptedData;
}
/**
 * OpenAPI 2.0 签名
 * @description https://opendocs.alipay.com/common/02kf5q
 * @param {string} method 调用接口方法名，比如 alipay.ebpp.bill.add
 * @param {object} params 请求参数
 * @param {object} config sdk 配置
 */
function sign(method, params, config, options) {
    const signParams = {
        method,
        appId: config.appId,
        charset: config.charset,
        version: config.version,
        signType: config.signType,
        timestamp: (0, utility_1.YYYYMMDDHHmmss)(),
    };
    for (const key in params) {
        if (key === 'bizContent' || key === 'biz_content' || key === 'needEncrypt')
            continue;
        signParams[key] = params[key];
    }
    if (config.appCertSn && config.alipayRootCertSn) {
        signParams.appCertSn = config.appCertSn;
        signParams.alipayRootCertSn = config.alipayRootCertSn;
    }
    if (config.wsServiceUrl) {
        signParams.wsServiceUrl = config.wsServiceUrl;
    }
    // 兼容官网的 biz_content;
    if (params.bizContent && params.biz_content) {
        throw new TypeError('不能同时设置 bizContent 和 biz_content');
    }
    let bizContent = params.bizContent ?? params.biz_content;
    if (bizContent) {
        if (options?.bizContentAutoSnakeCase !== false) {
            bizContent = (0, snakecase_keys_1.default)(bizContent);
        }
        // AES加密
        if (params.needEncrypt) {
            if (!config.encryptKey) {
                throw new TypeError('请设置 encryptKey 参数');
            }
            signParams.encryptType = 'AES';
            signParams.bizContent = aesEncrypt(bizContent, config.encryptKey);
        }
        else {
            signParams.bizContent = JSON.stringify(bizContent);
        }
    }
    // params key 驼峰转下划线
    const decamelizeParams = (0, snakecase_keys_1.default)(signParams);
    // 排序
    // ignore biz_content
    const signString = Object.keys(decamelizeParams).sort()
        .map(key => {
        let data = decamelizeParams[key];
        if (Array.prototype.toString.call(data) !== '[object String]') {
            data = JSON.stringify(data);
        }
        // return `${key}=${iconv.encode(data, config.charset!)}`;
        return `${key}=${data}`;
    })
        .join('&');
    // 计算签名
    const algorithm = exports.ALIPAY_ALGORITHM_MAPPING[config.signType];
    decamelizeParams.sign = (0, node_crypto_1.createSign)(algorithm)
        .update(signString, 'utf8').sign(config.privateKey, 'base64');
    debug('algorithm: %s, signString: %o, sign: %o', algorithm, signString, decamelizeParams.sign);
    return decamelizeParams;
}
/** OpenAPI 3.0 签名，使用应用私钥签名 */
function signatureV3(signString, appPrivateKey) {
    return (0, node_crypto_1.createSign)('RSA-SHA256')
        .update(signString, 'utf-8')
        .sign(appPrivateKey, 'base64');
}
/** OpenAPI 3.0 验签，使用支付宝公钥验证签名 */
function verifySignatureV3(signString, expectedSignature, alipayPublicKey) {
    return (0, node_crypto_1.createVerify)('RSA-SHA256')
        .update(signString, 'utf-8')
        .verify(alipayPublicKey, expectedSignature, 'base64');
}
function createRequestId() {
    return (0, node_crypto_1.randomUUID)().replaceAll('-', '');
}
async function readableToBytes(stream) {
    const chunks = [];
    let chunk;
    let totalLength = 0;
    for await (chunk of stream) {
        chunks.push(chunk);
        totalLength += chunk.length;
    }
    return Buffer.concat(chunks, totalLength);
}
/* c8 ignore start */
// forked from https://github.com/sindresorhus/decamelize/blob/main/index.js
function decamelize(text) {
    const separator = '_';
    const preserveConsecutiveUppercase = false;
    if (typeof text !== 'string') {
        throw new TypeError('The `text` arguments should be of type `string`');
    }
    // Checking the second character is done later on. Therefore process shorter strings here.
    if (text.length < 2) {
        return preserveConsecutiveUppercase ? text : text.toLowerCase();
    }
    const replacement = `$1${separator}$2`;
    // Split lowercase sequences followed by uppercase character.
    // `dataForUSACounties` → `data_For_USACounties`
    // `myURLstring → `my_URLstring`
    const decamelized = text.replace(/([\p{Lowercase_Letter}\d])(\p{Uppercase_Letter})/gu, replacement);
    if (preserveConsecutiveUppercase) {
        return handlePreserveConsecutiveUppercase(decamelized, separator);
    }
    // Split multiple uppercase characters followed by one or more lowercase characters.
    // `my_URLstring` → `my_ur_lstring`
    return decamelized
        .replace(/(\p{Uppercase_Letter})(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu, replacement)
        .toLowerCase();
}
function handlePreserveConsecutiveUppercase(decamelized, separator) {
    // Lowercase all single uppercase characters. As we
    // want to preserve uppercase sequences, we cannot
    // simply lowercase the separated string at the end.
    // `data_For_USACounties` → `data_for_USACounties`
    decamelized = decamelized.replace(/((?<![\p{Uppercase_Letter}\d])[\p{Uppercase_Letter}\d](?![\p{Uppercase_Letter}\d]))/gu, $0 => $0.toLowerCase());
    // Remaining uppercase sequences will be separated from lowercase sequences.
    // `data_For_USACounties` → `data_for_USA_counties`
    return decamelized.replace(/(\p{Uppercase_Letter}+)(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu, (_, $1, $2) => $1 + separator + $2.toLowerCase());
}
/* c8 ignore stop */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQTRCQSx3Q0FJQztBQUVELHdDQUtDO0FBR0QsZ0NBR0M7QUFHRCxnQ0FJQztBQWNELG9CQW1FQztBQUdELGtDQUlDO0FBR0QsOENBSUM7QUFFRCwwQ0FFQztBQUVELDBDQVNDO0FBSUQsZ0NBbUNDO0FBek1ELHlDQUFxQztBQUNyQyw2Q0FBbUU7QUFHbkUscUNBQXlDO0FBQ3pDLG9FQUEyQztBQUMzQywwREFBaUM7QUFHakMsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFN0IsUUFBQSx3QkFBd0IsR0FBRztJQUN0QyxHQUFHLEVBQUUsVUFBVTtJQUNmLElBQUksRUFBRSxZQUFZO0NBQ25CLENBQUM7QUFFRiwwRkFBMEY7QUFDMUYsMERBQTBEO0FBQzFELHNIQUFzSDtBQUN0SCxNQUFNLEVBQUUsR0FBRyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFFdEUsU0FBUyxRQUFRLENBQUMsTUFBYztJQUM5QixPQUFPO1FBQ0wsRUFBRSxFQUFFLEVBQUU7UUFDTixHQUFHLEVBQUUsbUJBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDdkMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsU0FBaUIsRUFBRSxNQUFjO0lBQzlELE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sYUFBYSxHQUFHLG1CQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM5RSxPQUFP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