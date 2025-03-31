"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlipayFormData = void 0;
class AlipayFormData {
    method;
    files;
    fields;
    constructor() {
        this.fields = [];
        this.files = [];
        this.method = 'post';
    }
    getFields() { return this.fields; }
    getFiles() { return this.files; }
    getMethod() { return this.method; }
    /**
     * 设置 method
     * post、get 的区别在于 post 会返回 form 表单，get 返回 url
     */
    setMethod(method) {
        this.method = method.toLowerCase();
    }
    /**
     * 增加字段
     * @param fieldName 字段名
     * @param fieldValue 字段值
     */
    addField(fieldName, fieldValue) {
        if (isJSONString(fieldValue)) {
            // 当 fieldValue 为 json 字符串时，解析出 json
            this.fields.push({ name: fieldName, value: JSON.parse(fieldValue) });
        }
        else {
            this.fields.push({ name: fieldName, value: fieldValue });
        }
    }
    /**
     * 增加文件
     * @param fieldName 文件字段名
     * @param fileName 文件名
     * @param filePath 文件绝对路径，或者文件流，又或者文件内容 Buffer
     */
    addFile(fieldName, fileName, filePath) {
        const file = {
            fieldName,
            name: fileName,
        };
        if (typeof filePath === 'string') {
            file.path = filePath;
        }
        else if (Buffer.isBuffer(filePath)) {
            file.content = filePath;
        }
        else {
            file.stream = filePath;
        }
        this.files.push(file);
    }
}
exports.AlipayFormData = AlipayFormData;
// forked form https://github.com/joaquimserafim/is-json/blob/master/index.js#L6
function isJSONString(value) {
    if (typeof value !== 'string')
        return false;
    value = value.replace(/\s/g, '').replace(/\n|\r/, '');
    if (/^\{(.*?)\}$/.test(value)) {
        return /"(.*?)":(.*?)/g.test(value);
    }
    if (/^\[(.*?)\]$/.test(value)) {
        return value.replace(/^\[/, '')
            .replace(/\]$/, '')
            .replace(/},{/g, '}\n{')
            .split(/\n/)
            .map((s) => { return isJSONString(s); })
            .reduce(function (_prev, curr) { return !!curr; });
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQW9CQSxNQUFhLGNBQWM7SUFDakIsTUFBTSxDQUFTO0lBQ2hCLEtBQUssQ0FBVTtJQUNmLE1BQU0sQ0FBVztJQUV4QjtRQUNFLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNuQyxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNqQyxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUVuQzs7O09BR0c7SUFDSCxTQUFTLENBQUMsTUFBYztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxTQUFpQixFQUFFLFVBQWU7UUFDekMsSUFBSSxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3QixvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLFNBQWlCLEVBQUUsUUFBZ0IsRUFBRSxRQUFvQztRQUMvRSxNQUFNLElBQUksR0FBVTtZQUNsQixTQUFTO1lBQ1QsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUFDO1FBQ0YsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUN2QixDQUFDO2FBQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBekRELHdDQXlEQztBQUVELGdGQUFnRjtBQUNoRixTQUFTLFlBQVksQ0FBQyxLQUFVO0lBQzlCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzVDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM5QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQzthQUM1QixPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQzthQUNsQixPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQzthQUN2QixLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsR0FBRyxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvQyxNQUFNLENBQUMsVUFBUyxLQUFhLEVBQUUsSUFBWSxJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMifQ==