import { Readable } from 'node:stream';
export interface IFile {
    /** 文件名 */
    name: string;
    /** 表单字段名 */
    fieldName: string;
    /** 文件路径 */
    path?: string;
    /** 文件流 */
    stream?: Readable;
    /** 文件内容 */
    content?: Buffer;
}
export interface IField {
    name: string;
    value: string | object;
}
export declare class AlipayFormData {
    private method;
    files: IFile[];
    fields: IField[];
    constructor();
    getFields(): IField[];
    getFiles(): IFile[];
    getMethod(): string;
    /**
     * 设置 method
     * post、get 的区别在于 post 会返回 form 表单，get 返回 url
     */
    setMethod(method: string): void;
    /**
     * 增加字段
     * @param fieldName 字段名
     * @param fieldValue 字段值
     */
    addField(fieldName: string, fieldValue: any): void;
    /**
     * 增加文件
     * @param fieldName 文件字段名
     * @param fileName 文件名
     * @param filePath 文件绝对路径，或者文件流，又或者文件内容 Buffer
     */
    addFile(fieldName: string, fileName: string, filePath: string | Readable | Buffer): void;
}
