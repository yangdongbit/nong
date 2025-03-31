import path from 'node:path';
import _FormData from 'form-data';
// eslint-disable-next-line
const NON_ASCII_RE = /[^\x00-\x7F]/i;
export class FormData extends _FormData {
    _getContentDisposition(value, options) {
        // support non-ascii filename
        // https://github.com/form-data/form-data/pull/571
        let filename;
        let contentDisposition;
        if (typeof options.filepath === 'string') {
            // custom filepath for relative paths
            filename = path.normalize(options.filepath).replace(/\\/g, '/');
        }
        else if (options.filename || value.name || value.path) {
            // custom filename take precedence
            // formidable and the browser add a name property
            // fs- and request- streams have path property
            filename = path.basename(options.filename || value.name || value.path);
        }
        else if (value.readable && value.hasOwnProperty('httpVersion')) {
            // or try http response
            filename = path.basename(value.client._httpMessage.path || '');
        }
        if (filename) {
            // https://datatracker.ietf.org/doc/html/rfc6266#section-4.1
            // support non-ascii filename
            contentDisposition = 'filename="' + filename + '"';
            if (NON_ASCII_RE.test(filename)) {
                contentDisposition += '; filename*=UTF-8\'\'' + encodeURIComponent(filename);
            }
        }
        return contentDisposition;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRm9ybURhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDO0FBQzdCLE9BQU8sU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUVsQywyQkFBMkI7QUFDM0IsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDO0FBRXJDLE1BQU0sT0FBTyxRQUFTLFNBQVEsU0FBUztJQUNyQyxzQkFBc0IsQ0FBQyxLQUFVLEVBQUUsT0FBWTtRQUM3Qyw2QkFBNkI7UUFDN0Isa0RBQWtEO1FBQ2xELElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSSxrQkFBa0IsQ0FBQztRQUV2QixJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN6QyxxQ0FBcUM7WUFDckMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEUsQ0FBQzthQUFNLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4RCxrQ0FBa0M7WUFDbEMsaURBQWlEO1lBQ2pELDhDQUE4QztZQUM5QyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pFLENBQUM7YUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQ2pFLHVCQUF1QjtZQUN2QixRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELElBQUksUUFBUSxFQUFFLENBQUM7WUFDYiw0REFBNEQ7WUFDNUQsNkJBQTZCO1lBQzdCLGtCQUFrQixHQUFHLFlBQVksR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDO1lBQ25ELElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxrQkFBa0IsSUFBSSx1QkFBdUIsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvRSxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sa0JBQWtCLENBQUM7SUFDNUIsQ0FBQztDQUNGIn0=