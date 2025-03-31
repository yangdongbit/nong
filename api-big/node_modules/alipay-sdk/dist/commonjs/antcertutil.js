"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPublicKeyFromPath = loadPublicKeyFromPath;
exports.loadPublicKey = loadPublicKey;
exports.getSNFromPath = getSNFromPath;
exports.getSN = getSN;
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = require("node:crypto");
const bignumber_js_1 = require("bignumber.js");
const x509_1 = require("@fidm/x509");
/** 从公钥证书文件里读取支付宝公钥 */
function loadPublicKeyFromPath(filePath) {
    const fileData = node_fs_1.default.readFileSync(filePath);
    const certificate = x509_1.Certificate.fromPEM(fileData);
    return certificate.publicKeyRaw.toString('base64');
}
/** 从公钥证书内容或 Buffer 读取支付宝公钥 */
function loadPublicKey(content) {
    const pemContent = typeof content === 'string' ? Buffer.from(content) : content;
    const certificate = x509_1.Certificate.fromPEM(pemContent);
    return certificate.publicKeyRaw.toString('base64');
}
/** 从证书文件里读取序列号 */
function getSNFromPath(filePath, isRoot = false) {
    const fileData = node_fs_1.default.readFileSync(filePath);
    return getSN(fileData, isRoot);
}
/** 从上传的证书内容或 Buffer 读取序列号 */
function getSN(fileData, isRoot = false) {
    const pemData = typeof fileData === 'string' ? Buffer.from(fileData) : fileData;
    if (isRoot) {
        return getRootCertSN(pemData);
    }
    const certificate = x509_1.Certificate.fromPEM(pemData);
    return getCertSN(certificate);
}
/** 读取序列号 */
function getCertSN(certificate) {
    const { issuer, serialNumber } = certificate;
    const principalName = issuer.attributes
        .reduceRight((prev, curr) => {
        const { shortName, value } = curr;
        const result = `${prev}${shortName}=${value},`;
        return result;
    }, '')
        .slice(0, -1);
    const decimalNumber = new bignumber_js_1.BigNumber(serialNumber, 16).toString(10);
    const SN = (0, node_crypto_1.createHash)('md5')
        .update(principalName + decimalNumber, 'utf8')
        .digest('hex');
    return SN;
}
/** 读取根证书序列号 */
function getRootCertSN(rootContent) {
    const certificates = x509_1.Certificate.fromPEMs(rootContent);
    let rootCertSN = '';
    certificates.forEach(item => {
        if (item.signatureOID.startsWith('1.2.840.113549.1.1')) {
            const SN = getCertSN(item);
            if (rootCertSN.length === 0) {
                rootCertSN += SN;
            }
            else {
                rootCertSN += `_${SN}`;
            }
        }
    });
    return rootCertSN;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW50Y2VydHV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYW50Y2VydHV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFNQSxzREFJQztBQUdELHNDQUlDO0FBR0Qsc0NBR0M7QUFHRCxzQkFPQztBQWpDRCxzREFBeUI7QUFDekIsNkNBQXlDO0FBQ3pDLCtDQUF5QztBQUN6QyxxQ0FBeUM7QUFFekMsc0JBQXNCO0FBQ3RCLFNBQWdCLHFCQUFxQixDQUFDLFFBQWdCO0lBQ3BELE1BQU0sUUFBUSxHQUFHLGlCQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sV0FBVyxHQUFHLGtCQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xELE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVELDhCQUE4QjtBQUM5QixTQUFnQixhQUFhLENBQUMsT0FBd0I7SUFDcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDaEYsTUFBTSxXQUFXLEdBQUcsa0JBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEQsT0FBTyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRUQsa0JBQWtCO0FBQ2xCLFNBQWdCLGFBQWEsQ0FBQyxRQUFnQixFQUFFLE1BQU0sR0FBRyxLQUFLO0lBQzVELE1BQU0sUUFBUSxHQUFHLGlCQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBRUQsNkJBQTZCO0FBQzdCLFNBQWdCLEtBQUssQ0FBQyxRQUF5QixFQUFFLE1BQU0sR0FBRyxLQUFLO0lBQzdELE1BQU0sT0FBTyxHQUFHLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ2hGLElBQUksTUFBTSxFQUFFLENBQUM7UUFDWCxPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsTUFBTSxXQUFXLEdBQUcsa0JBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakQsT0FBTyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVELFlBQVk7QUFDWixTQUFTLFNBQVMsQ0FBQyxXQUF3QjtJQUN6QyxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVcsQ0FBQztJQUM3QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVTtTQUNwQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDbEMsTUFBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsU0FBUyxJQUFJLEtBQUssR0FBRyxDQUFDO1FBQy9DLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDTCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEIsTUFBTSxhQUFhLEdBQUcsSUFBSSx3QkFBUyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkUsTUFBTSxFQUFFLEdBQUcsSUFBQSx3QkFBVSxFQUFDLEtBQUssQ0FBQztTQUN6QixNQUFNLENBQUMsYUFBYSxHQUFHLGFBQWEsRUFBRSxNQUFNLENBQUM7U0FDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQztBQUVELGVBQWU7QUFDZixTQUFTLGFBQWEsQ0FBQyxXQUFtQjtJQUN4QyxNQUFNLFlBQVksR0FBRyxrQkFBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMxQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQztZQUN2RCxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM1QixVQUFVLElBQUksRUFBRSxDQUFDO1lBQ25CLENBQUM7aUJBQU0sQ0FBQztnQkFDTixVQUFVLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUN6QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQyJ9