export declare function strictJSONParse<T extends object = object>(content: string): T;
export declare function readJSONSync<T = any>(filepath: string): T;
export interface JSONStringifyOptions {
    /**
     * A string or number that's used to insert white space (including indentation, line break characters, etc.)
     * into the output JSON string for readability purposes.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#space
     */
    space?: number | string;
    replacer?: (this: any, key: string, value: any) => any;
}
export declare function writeJSONSync(filepath: string, content: string | object, options?: JSONStringifyOptions): void;
export declare function readJSON<T = any>(filepath: string): Promise<T>;
export declare function writeJSON(filepath: string, content: string | object, options?: JSONStringifyOptions): Promise<void>;
