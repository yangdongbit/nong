"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strictJSONParse = strictJSONParse;
exports.readJSONSync = readJSONSync;
exports.writeJSONSync = writeJSONSync;
exports.readJSON = readJSON;
exports.writeJSON = writeJSON;
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
function strictJSONParse(content) {
    const obj = JSON.parse(content);
    if (!obj || typeof obj !== 'object') {
        throw new Error('JSON string is not object');
    }
    return obj;
}
function readJSONSync(filepath) {
    return JSON.parse((0, node_fs_1.readFileSync)(filepath, 'utf8'));
}
function writeJSONSync(filepath, content, options = {}) {
    options.space = options.space ?? 2;
    if (typeof content === 'object') {
        content = JSON.stringify(content, options.replacer, options.space) + '\n';
    }
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(filepath), { recursive: true });
    (0, node_fs_1.writeFileSync)(filepath, content);
}
async function readJSON(filepath) {
    const content = await (0, promises_1.readFile)(filepath, 'utf8');
    return JSON.parse(content);
}
async function writeJSON(filepath, content, options = {}) {
    options.space = options.space ?? 2;
    if (typeof content === 'object') {
        content = JSON.stringify(content, options.replacer, options.space) + '\n';
    }
    await (0, promises_1.mkdir)((0, node_path_1.dirname)(filepath), { recursive: true });
    await (0, promises_1.writeFile)(filepath, content, 'utf8');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsMENBTUM7QUFFRCxvQ0FFQztBQVlELHNDQU9DO0FBRUQsNEJBR0M7QUFFRCw4QkFPQztBQS9DRCx5Q0FBb0M7QUFDcEMscUNBQWlFO0FBQ2pFLCtDQUE4RDtBQUU5RCxTQUFnQixlQUFlLENBQTRCLE9BQWU7SUFDeEUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQU0sQ0FBQztJQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBZ0IsWUFBWSxDQUFVLFFBQWdCO0lBQ3BELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFBLHNCQUFZLEVBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFNLENBQUM7QUFDekQsQ0FBQztBQVlELFNBQWdCLGFBQWEsQ0FBQyxRQUFnQixFQUFFLE9BQXdCLEVBQUUsVUFBZ0MsRUFBRTtJQUMxRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ25DLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDaEMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztJQUM1RSxDQUFDO0lBQ0QsSUFBQSxtQkFBUyxFQUFDLElBQUEsbUJBQU8sRUFBQyxRQUFRLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELElBQUEsdUJBQWEsRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQVUsUUFBZ0I7SUFDdEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLG1CQUFRLEVBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQU0sQ0FBQztBQUNsQyxDQUFDO0FBRU0sS0FBSyxVQUFVLFNBQVMsQ0FBQyxRQUFnQixFQUFFLE9BQXdCLEVBQUUsVUFBZ0MsRUFBRTtJQUM1RyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ25DLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDaEMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztJQUM1RSxDQUFDO0lBQ0QsTUFBTSxJQUFBLGdCQUFLLEVBQUMsSUFBQSxtQkFBTyxFQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDcEQsTUFBTSxJQUFBLG9CQUFTLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3QyxDQUFDIn0=