import { Stats } from 'node:fs';
/**
 * Check if a file exists.
 * Returns the file stats if it exists, or `false` if it doesn't.
 */
export declare function exists(file: string): Promise<Stats | false>;
