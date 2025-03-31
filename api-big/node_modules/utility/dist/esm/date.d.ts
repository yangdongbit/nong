export declare function resetTimezone(date: Date): string;
/**
 * return `[ YYYY, MM, DD, HH, mm, ss ]` date string array
 */
export declare function getDateStringParts(d?: Date, onlyDate?: boolean): string[];
/**
 * Access log format date. format: `moment().format('DD/MMM/YYYY:HH:mm:ss ZZ')`
 */
export declare function accessLogDate(d?: Date): string;
export declare function getTimezone(d: Date): unknown;
/**
 * Normal log format date. format: `moment().format('YYYY-MM-DD HH:mm:ss.SSS')`
 */
export declare function logDate(msSep?: string): string;
export declare function logDate(d?: Date): string;
export declare function logDate(d?: Date | null, msSep?: string): string;
export declare const YYYYMMDDHHmmssSSS: typeof logDate;
export interface YYYYMMDDHHmmssOptions {
    dateSep?: string;
    timeSep?: string;
}
/**
 * `moment().format('YYYY-MM-DD HH:mm:ss')` format date string.
 */
export declare function YYYYMMDDHHmmss(d?: Date | string | number, options?: YYYYMMDDHHmmssOptions): string;
/**
 * `moment().format('YYYY-MM-DD')` format date string.
 */
export declare function YYYYMMDD(d?: Date | string, sep?: string): string;
export interface DateStruct {
    YYYYMMDD: number;
    H: number;
}
/**
 * return datetime struct.
 *
 * @return {Object} date
 *  - {Number} YYYYMMDD, 20130401
 *  - {Number} H, 0, 1, 9, 12, 23
 */
export declare function datestruct(now?: Date): DateStruct;
/**
 * Get Unix's timestamp in seconds.
 */
export declare function timestamp(t?: number | string): number | Date;
/**
 * Parse timestamp to Date
 */
export declare function parseTimestamp(t: number | string): Date;
/**
 * Convert Date object to Unix timestamp in seconds.
 */
export declare function dateToUnixTimestamp(date: Date): number;
export declare enum DateFormat {
    DateTimeWithTimeZone = "DateTimeWithTimeZone",
    DateTimeWithMilliSeconds = "DateTimeWithMilliSeconds",
    DateTimeWithSeconds = "DateTimeWithSeconds",
    UnixTimestamp = "UnixTimestamp"
}
/**
 * Provide milliseconds, return a formatted string.
 */
export declare function getDateFromMilliseconds(milliseconds: number, format?: DateFormat): string;
