/** 从公钥证书文件里读取支付宝公钥 */
export declare function loadPublicKeyFromPath(filePath: string): string;
/** 从公钥证书内容或 Buffer 读取支付宝公钥 */
export declare function loadPublicKey(content: string | Buffer): string;
/** 从证书文件里读取序列号 */
export declare function getSNFromPath(filePath: string, isRoot?: boolean): string;
/** 从上传的证书内容或 Buffer 读取序列号 */
export declare function getSN(fileData: string | Buffer, isRoot?: boolean): string;
