"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exists;
const promises_1 = require("node:fs/promises");
/**
 * Check if a file exists.
 * Returns the file stats if it exists, or `false` if it doesn't.
 */
async function exists(file) {
    try {
        return await (0, promises_1.stat)(file);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSx3QkFTQztBQWZELCtDQUF3QztBQUV4Qzs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsTUFBTSxDQUFDLElBQVk7SUFDdkMsSUFBSSxDQUFDO1FBQ0gsT0FBTyxNQUFNLElBQUEsZUFBSSxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ2xCLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMxQixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLEdBQUcsQ0FBQztJQUNaLENBQUM7QUFDSCxDQUFDIn0=