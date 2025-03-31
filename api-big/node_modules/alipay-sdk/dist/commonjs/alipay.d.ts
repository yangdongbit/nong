import { IncomingHttpHeaders } from 'urllib';
import type { HttpMethod, RawResponseWithMeta, ProxyAgent } from 'urllib';
import { AlipayFormStream } from './AlipayFormStream.js';
import type { AlipaySdkConfig, AlipaySdkSignType } from './types.js';
import { AlipayFormData } from './form.js';
export interface AlipayRequestErrorSupportLink {
    link: string;
    desc: string;
}
export interface AlipayRequestErrorOptions extends ErrorOptions {
    /** 错误码 https://opendocs.alipay.com/open-v3/054fcv?pathHash=7bdeefa1 */
    code?: string;
    traceId?: string;
    responseHttpStatus?: number;
    responseDataRaw?: string;
    responseHttpHeaders?: IncomingHttpHeaders;
    links?: AlipayRequestErrorSupportLink[];
}
export declare class AlipayRequestError extends Error {
    code?: string;
    traceId?: string;
    responseHttpStatus?: number;
    responseDataRaw?: string;
    responseHttpHeaders?: IncomingHttpHeaders;
    links?: AlipayRequestErrorSupportLink[];
    constructor(message: string, options?: AlipayRequestErrorOptions);
}
export interface AlipayCommonResult<T = any> {
    data: T;
    responseHttpStatus: number;
    traceId: string;
}
export interface AlipayCommonResultStream {
    stream: RawResponseWithMeta;
    responseHttpStatus: number;
    traceId: string;
}
export declare enum SSEField {
    EVENT = "event",
    DATA = "data",
    ID = "id",
    RETRY = "retry"
}
export interface AlipaySSEItem {
    event: string;
    data: string;
}
export interface AlipaySdkCommonResult {
    /**
     * 响应码。10000 表示成功，其余详见 https://opendocs.alipay.com/common/02km9f
     */
    code: string;
    /** 响应讯息。Success 表示成功。 */
    msg: string;
    /**
     * 明细错误码
     * @see https://opendocs.alipay.com/common/02km9f
     */
    sub_code?: string;
    /** 错误辅助信息 */
    sub_msg?: string;
    /** trace id */
    traceId?: string;
    /** 请求返回内容，详见各业务接口 */
    [key: string]: any;
}
export interface IRequestParams {
    [key: string]: any;
    /** 业务请求参数 */
    bizContent?: Record<string, any>;
    /** 自动 AES 加解密 */
    needEncrypt?: boolean;
}
export type IPageExecuteMethod = 'GET' | 'POST';
export interface IPageExecuteParams extends IRequestParams {
    method?: IPageExecuteMethod;
}
export interface ISdkExecuteOptions {
    /**
     * 对 bizContent 做驼峰参数转为小写 + 下划线参数，如 outOrderNo => out_order_no，默认 true，如果不需要自动转换，请设置为 false
     */
    bizContentAutoSnakeCase?: boolean;
}
export interface IRequestOption {
    validateSign?: boolean;
    log?: {
        info(...args: any[]): any;
        error(...args: any[]): any;
    };
    formData?: AlipayFormData;
    /**
     * 请求的唯一标识
     * @see https://opendocs.alipay.com/open-v3/054oog?pathHash=7834d743#%E8%AF%B7%E6%B1%82%E7%9A%84%E5%94%AF%E4%B8%80%E6%A0%87%E8%AF%86
     */
    traceId?: string;
}
export interface AlipayCURLOptions {
    /** 参数需在请求 URL 传参 */
    query?: Record<string, string | number>;
    /** 参数需在请求 JSON 传参 */
    body?: Record<string, any>;
    /** 表单方式提交数据 */
    form?: AlipayFormData | AlipayFormStream;
    /** 调用方的 requestId，用于定位一次请求，需要每次请求保持唯一 */
    requestId?: string;
    /**
     * 请求内容加密，目前只支持 AES
     * 注意：只支持 body 参数加密，如果同时设置 form 和 needEncrypt，会抛 TypeError 异常
     */
    needEncrypt?: boolean;
    /**
     * 应用授权令牌，代商家调用支付宝开放接口必填
     */
    appAuthToken?: string;
    /** 请求超时时间，默认使用 config.timeout */
    requestTimeout?: number;
    /** 支持覆盖默认的 agent  */
    agent?: ProxyAgent;
}
/**
 * Alipay OpenAPI SDK for Node.js
 */
export declare class AlipaySdk {
    #private;
    readonly version = "alipay-sdk-nodejs-4.0.0";
    config: Required<AlipaySdkConfig>;
    /**
     * @class
     * @param {AlipaySdkConfig} config 初始化 SDK 配置
     */
    constructor(config: AlipaySdkConfig);
    private formatKey;
    private formatUrl;
    /**
     * Alipay OpenAPI V3 with JSON Response
     * @see https://opendocs.alipay.com/open-v3/054kaq?pathHash=b3eb94e6
     */
    curl<T = any>(httpMethod: HttpMethod, path: string, options?: AlipayCURLOptions): Promise<AlipayCommonResult<T>>;
    /**
     * Alipay OpenAPI V3 with Stream Response
     * @see https://opendocs.alipay.com/open-v3/054kaq?pathHash=b3eb94e6
     */
    curlStream<T = any>(httpMethod: HttpMethod, path: string, options?: AlipayCURLOptions): Promise<AlipayCommonResultStream>;
    /**
     * Alipay OpenAPI V3 with SSE Response
     * @see https://opendocs.alipay.com/open-v3/054kaq?pathHash=b3eb94e6
     */
    sse(httpMethod: HttpMethod, path: string, options?: AlipayCURLOptions): AsyncGenerator<{
        event: string;
        data: string;
    }, void, unknown>;
    /**
     * 生成请求字符串，用于客户端进行调用
     * @param {string} method 方法名
     * @param {IRequestParams} bizParams 请求参数
     * @param {object} bizParams.bizContent 业务请求参数
     * @return {string} 请求字符串
     */
    sdkExecute(method: string, bizParams: IRequestParams, options?: ISdkExecuteOptions): string;
    /**
     * @alias sdkExecute
     */
    sdkExec(method: string, bizParams: IRequestParams): string;
    /**
     * 生成网站接口请求链接或 POST 表单 Form HTML
     * @param {string} method 方法名
     * @param {IPageExecuteMethod} httpMethod 后续进行请求的方法。如为 GET，即返回 http 链接；如为 POST，则生成表单 Form HTML
     * @param {IPageExecuteParams} bizParams 请求参数
     * @param {object} bizParams.bizContent 业务请求参数
     * @return {string} GET 请求链接或 POST 表单 Form HTML
     */
    pageExecute(method: string, bizParams: IPageExecuteParams): string;
    pageExecute(method: string, httpMethod: IPageExecuteMethod, bizParams: IPageExecuteParams): string;
    /**
     * @alias pageExecute
     */
    pageExec(method: string, bizParams: IPageExecuteParams): string;
    pageExec(method: string, httpMethod: IPageExecuteMethod, bizParams: IPageExecuteParams): string;
    private notifyRSACheck;
    /**
     * @ignore
     * @param originStr 开放平台返回的原始字符串
     * @param responseKey xx_response 方法名 key
     */
    getSignStr(originStr: string, responseKey: string): string;
    /**
     * 执行请求，调用支付宝服务端
     * @param {string} method 调用接口方法名，比如 alipay.ebpp.bill.add
     * @param {IRequestParams} params 请求参数
     * @param {object} params.bizContent 业务请求参数
     * @param {IRequestOption} options 选项
     * @param {Boolean} options.validateSign 是否验签
     * @param {Console} options.log 可选日志记录对象
     * @return {Promise<AlipaySdkCommonResult | string>} 请求执行结果
     */
    exec(method: string, params?: IRequestParams, options?: IRequestOption): Promise<AlipaySdkCommonResult>;
    checkResponseSign(responseDataRaw: string, responseKey: string, serverSign: string, traceId: string): void;
    /**
     * 通知验签，不对 value 进行 decode
     * @param {JSON} postData 服务端的消息内容
     * @return { Boolean } 验签是否成功
     */
    checkNotifySignV2(postData: any): boolean;
    /**
     * 通知验签
     * @param {JSON} postData 服务端的消息内容
     * @param {Boolean} raw 是否使用 raw 内容而非 decode 内容验签
     * @return { Boolean } 验签是否成功
     */
    checkNotifySign(postData: any, raw?: boolean): boolean;
    /**
     * 对加密内容进行 AES 解密
     * @see https://opendocs.alipay.com/common/02mse3#AES%20%E8%A7%A3%E5%AF%86%E5%87%BD%E6%95%B0
     * @param encryptedText 加密内容字符串
     */
    aesDecrypt(encryptedText: string): string;
    /**
     * 对指定内容进行验签
     *
     * 如对前端返回的报文进行验签 https://opendocs.alipay.com/common/02mse3#AES%20%E8%A7%A3%E5%AF%86%E5%87%BD%E6%95%B0
     */
    rsaCheck(signContent: string, sign: string, signType?: AlipaySdkSignType): boolean;
}
