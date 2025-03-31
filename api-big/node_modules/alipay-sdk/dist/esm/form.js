export class AlipayFormData {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9CQSxNQUFNLE9BQU8sY0FBYztJQUNqQixNQUFNLENBQVM7SUFDaEIsS0FBSyxDQUFVO0lBQ2YsTUFBTSxDQUFXO0lBRXhCO1FBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25DLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRW5DOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxNQUFjO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFNBQWlCLEVBQUUsVUFBZTtRQUN6QyxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzdCLG9DQUFvQztZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFLFFBQW9DO1FBQy9FLE1BQU0sSUFBSSxHQUFVO1lBQ2xCLFNBQVM7WUFDVCxJQUFJLEVBQUUsUUFBUTtTQUNmLENBQUM7UUFDRixJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLENBQUM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0NBQ0Y7QUFFRCxnRkFBZ0Y7QUFDaEYsU0FBUyxZQUFZLENBQUMsS0FBVTtJQUM5QixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUM1QyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN0RCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM5QixPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDOUIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7YUFDNUIsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7YUFDbEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7YUFDdkIsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNYLEdBQUcsQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLEdBQUcsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0MsTUFBTSxDQUFDLFVBQVMsS0FBYSxFQUFFLElBQVksSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIn0=