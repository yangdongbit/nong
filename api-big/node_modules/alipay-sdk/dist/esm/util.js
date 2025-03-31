import { debuglog } from 'node:util';
import { createSign, createVerify, randomUUID } from 'node:crypto';
import { YYYYMMDDHHmmss } from 'utility';
import snakeCaseKeys from 'snakecase-keys';
import CryptoJS from 'crypto-js';
const debug = debuglog('alipay-sdk:util');
export const ALIPAY_ALGORITHM_MAPPING = {
    RSA: 'RSA-SHA1',
    RSA2: 'RSA-SHA256',
};
// https://opendocs.alipay.com/common/02mse3#NodeJS%20%E8%A7%A3%E5%AF%86%E7%A4%BA%E4%BE%8B
// 初始向量的方法, 全部为0. 这里的写法适合于其它算法,针对AES算法的话,IV值一定是128位的(16字节)
// https://opendocs.alipay.com/open-v3/054l3e?pathHash=5d1dc939#%E8%AF%B7%E6%B1%82%E6%8A%A5%E6%96%87%E5%8A%A0%E5%AF%86
const IV = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
function parseKey(aesKey) {
    return {
        iv: IV,
        key: CryptoJS.enc.Base64.parse(aesKey),
    };
}
export function aesEncryptText(plainText, aesKey) {
    const { iv, key } = parseKey(aesKey);
    const encryptedText = CryptoJS.AES.encrypt(plainText, key, { iv }).toString();
    return encryptedText;
}
export function aesDecryptText(encryptedText, aesKey) {
    const { iv, key } = parseKey(aesKey);
    const bytes = CryptoJS.AES.decrypt(encryptedText, key, { iv });
    const plainText = bytes.toString(CryptoJS.enc.Utf8);
    return plainText;
}
// 先加密后加签，aesKey 是支付宝开放平台返回的 base64 格式加密 key
export function aesEncrypt(data, aesKey) {
    const plainText = JSON.stringify(data);
    return aesEncryptText(plainText, aesKey);
}
// 解密
export function aesDecrypt(encryptedText, aesKey) {
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
export function sign(method, params, config, options) {
    const signParams = {
        method,
        appId: config.appId,
        charset: config.charset,
        version: config.version,
        signType: config.signType,
        timestamp: YYYYMMDDHHmmss(),
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
            bizContent = snakeCaseKeys(bizContent);
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
    const decamelizeParams = snakeCaseKeys(signParams);
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
    const algorithm = ALIPAY_ALGORITHM_MAPPING[config.signType];
    decamelizeParams.sign = createSign(algorithm)
        .update(signString, 'utf8').sign(config.privateKey, 'base64');
    debug('algorithm: %s, signString: %o, sign: %o', algorithm, signString, decamelizeParams.sign);
    return decamelizeParams;
}
/** OpenAPI 3.0 签名，使用应用私钥签名 */
export function signatureV3(signString, appPrivateKey) {
    return createSign('RSA-SHA256')
        .update(signString, 'utf-8')
        .sign(appPrivateKey, 'base64');
}
/** OpenAPI 3.0 验签，使用支付宝公钥验证签名 */
export function verifySignatureV3(signString, expectedSignature, alipayPublicKey) {
    return createVerify('RSA-SHA256')
        .update(signString, 'utf-8')
        .verify(alipayPublicKey, expectedSignature, 'base64');
}
export function createRequestId() {
    return randomUUID().replaceAll('-', '');
}
export async function readableToBytes(stream) {
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
export function decamelize(text) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDckMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR25FLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDekMsT0FBTyxhQUFhLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxRQUFRLE1BQU0sV0FBVyxDQUFDO0FBR2pDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHO0lBQ3RDLEdBQUcsRUFBRSxVQUFVO0lBQ2YsSUFBSSxFQUFFLFlBQVk7Q0FDbkIsQ0FBQztBQUVGLDBGQUEwRjtBQUMxRiwwREFBMEQ7QUFDMUQsc0hBQXNIO0FBQ3RILE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBRXRFLFNBQVMsUUFBUSxDQUFDLE1BQWM7SUFDOUIsT0FBTztRQUNMLEVBQUUsRUFBRSxFQUFFO1FBQ04sR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDdkMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLFNBQWlCLEVBQUUsTUFBYztJQUM5RCxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM5RSxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBQyxhQUFxQixFQUFFLE1BQWM7SUFDbEUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsTUFBTSxVQUFVLFVBQVUsQ0FBQyxJQUFZLEVBQUUsTUFBYztJQUNyRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sY0FBYyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUQsS0FBSztBQUNMLE1BQU0sVUFBVSxVQUFVLENBQUMsYUFBcUIsRUFBRSxNQUFjO0lBQzlELE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDeEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QyxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBT0Q7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLElBQUksQ0FBQyxNQUFjLEVBQUUsTUFBMkIsRUFBRSxNQUFpQyxFQUFFLE9BQXFCO0lBQ3hILE1BQU0sVUFBVSxHQUF3QjtRQUN0QyxNQUFNO1FBQ04sS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO1FBQ25CLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztRQUN2QixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87UUFDdkIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1FBQ3pCLFNBQVMsRUFBRSxjQUFjLEVBQUU7S0FDNUIsQ0FBQztJQUNGLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDekIsSUFBSSxHQUFHLEtBQUssWUFBWSxJQUFJLEdBQUcsS0FBSyxhQUFhLElBQUksR0FBRyxLQUFLLGFBQWE7WUFBRSxTQUFTO1FBQ3JGLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNoRCxVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDeEMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUN4RCxDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDeEIsVUFBVSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ2hELENBQUM7SUFFRCxxQkFBcUI7SUFDckIsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QyxNQUFNLElBQUksU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUV6RCxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEVBQUUsdUJBQXVCLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDL0MsVUFBVSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsUUFBUTtRQUNSLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sSUFBSSxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBQ0QsVUFBVSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDL0IsVUFBVSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQ2hDLFVBQVUsRUFDVixNQUFNLENBQUMsVUFBVSxDQUNsQixDQUFDO1FBQ0osQ0FBQzthQUFNLENBQUM7WUFDTixVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsQ0FBQztJQUNILENBQUM7SUFFRCxvQkFBb0I7SUFDcEIsTUFBTSxnQkFBZ0IsR0FBd0IsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hFLEtBQUs7SUFDTCxxQkFBcUI7SUFDckIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksRUFBRTtTQUNwRCxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDVCxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxpQkFBaUIsRUFBRSxDQUFDO1lBQzlELElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCwwREFBMEQ7UUFDMUQsT0FBTyxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUMxQixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFYixPQUFPO0lBQ1AsTUFBTSxTQUFTLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVELGdCQUFnQixDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1NBQzFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDaEUsS0FBSyxDQUFDLHlDQUF5QyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0YsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDO0FBRUQsOEJBQThCO0FBQzlCLE1BQU0sVUFBVSxXQUFXLENBQUMsVUFBa0IsRUFBRSxhQUFxQjtJQUNuRSxPQUFPLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDNUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUM7U0FDM0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsaUNBQWlDO0FBQ2pDLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxVQUFrQixFQUFFLGlCQUF5QixFQUFFLGVBQXVCO0lBQ3RHLE9BQU8sWUFBWSxDQUFDLFlBQVksQ0FBQztTQUM5QixNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQztTQUMzQixNQUFNLENBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFFRCxNQUFNLFVBQVUsZUFBZTtJQUM3QixPQUFPLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsZUFBZSxDQUFDLE1BQWlDO0lBQ3JFLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixJQUFJLEtBQWEsQ0FBQztJQUNsQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsSUFBSSxLQUFLLEVBQUUsS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkIsV0FBVyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDOUIsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELHFCQUFxQjtBQUNyQiw0RUFBNEU7QUFDNUUsTUFBTSxVQUFVLFVBQVUsQ0FBQyxJQUFZO0lBQ3JDLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUN0QixNQUFNLDRCQUE0QixHQUFHLEtBQUssQ0FBQztJQUMzQyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxTQUFTLENBQ2pCLGlEQUFpRCxDQUNsRCxDQUFDO0lBQ0osQ0FBQztJQUVELDBGQUEwRjtJQUMxRixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDcEIsT0FBTyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbEUsQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLEtBQUssU0FBUyxJQUFJLENBQUM7SUFDdkMsNkRBQTZEO0lBQzdELGdEQUFnRDtJQUNoRCxnQ0FBZ0M7SUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FDOUIsb0RBQW9ELEVBQ3BELFdBQVcsQ0FDWixDQUFDO0lBRUYsSUFBSSw0QkFBNEIsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sa0NBQWtDLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxvRkFBb0Y7SUFDcEYsbUNBQW1DO0lBQ25DLE9BQU8sV0FBVztTQUNmLE9BQU8sQ0FDTixxRUFBcUUsRUFDckUsV0FBVyxDQUNaO1NBQ0EsV0FBVyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsa0NBQWtDLENBQUMsV0FBbUIsRUFBRSxTQUFpQjtJQUNoRixtREFBbUQ7SUFDbkQsa0RBQWtEO0lBQ2xELG9EQUFvRDtJQUNwRCxrREFBa0Q7SUFDbEQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQy9CLHVGQUF1RixFQUN2RixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FDdkIsQ0FBQztJQUVGLDRFQUE0RTtJQUM1RSxtREFBbUQ7SUFDbkQsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUN4QixzRUFBc0UsRUFDdEUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQ2pELENBQUM7QUFDSixDQUFDO0FBQ0Qsb0JBQW9CIn0=