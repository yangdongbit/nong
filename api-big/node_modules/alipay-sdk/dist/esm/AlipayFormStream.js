import FormStream from 'formstream';
export class AlipayFormStream extends FormStream {
    constructor(options) {
        super({
            // set default minChunkSize to 2MB
            minChunkSize: 1024 * 1024 * 2,
            ...options,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxpcGF5Rm9ybVN0cmVhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9BbGlwYXlGb3JtU3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQU9wQyxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsVUFBVTtJQUM5QyxZQUFZLE9BQWlDO1FBQzNDLEtBQUssQ0FBQztZQUNKLGtDQUFrQztZQUNsQyxZQUFZLEVBQUUsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDO1lBQzdCLEdBQUcsT0FBTztTQUNYLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiJ9