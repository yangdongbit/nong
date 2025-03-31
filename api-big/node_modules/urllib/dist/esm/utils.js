import { randomBytes, createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { performance } from 'node:perf_hooks';
import { ReadableStream, TransformStream } from 'node:stream/web';
import { Blob } from 'node:buffer';
import symbols from './symbols.js';
const JSONCtlCharsMap = {
    '"': '\\"', // \u0022
    '\\': '\\\\', // \u005c
    '\b': '\\b', // \u0008
    '\f': '\\f', // \u000c
    '\n': '\\n', // \u000a
    '\r': '\\r', // \u000d
    '\t': '\\t', // \u0009
};
/* eslint no-control-regex: "off"*/
const JSONCtlCharsRE = /[\u0000-\u001F\u005C]/g;
function replaceOneChar(c) {
    return JSONCtlCharsMap[c] || '\\u' + (c.charCodeAt(0) + 0x10000).toString(16).substring(1);
}
function replaceJSONCtlChars(value) {
    return value.replace(JSONCtlCharsRE, replaceOneChar);
}
export function parseJSON(data, fixJSONCtlChars) {
    if (typeof fixJSONCtlChars === 'function') {
        data = fixJSONCtlChars(data);
    }
    else if (fixJSONCtlChars) {
        // https://github.com/node-modules/urllib/pull/77
        // remote the control characters (U+0000 through U+001F)
        data = replaceJSONCtlChars(data);
    }
    try {
        data = JSON.parse(data);
    }
    catch (err) {
        if (err.name === 'SyntaxError') {
            err.name = 'JSONResponseFormatError';
        }
        if (data.length > 1024) {
            // show 0~512 ... -512~end data
            err.message += ' (data json format: ' +
                JSON.stringify(data.slice(0, 512)) + ' ...skip... ' + JSON.stringify(data.slice(data.length - 512)) + ')';
        }
        else {
            err.message += ' (data json format: ' + JSON.stringify(data) + ')';
        }
        throw err;
    }
    return data;
}
function md5(s) {
    const sum = createHash('md5');
    sum.update(s, 'utf8');
    return sum.digest('hex');
}
const AUTH_KEY_VALUE_RE = /(\w{1,100})=["']?([^'"]+)["']?/;
let NC = 0;
const NC_PAD = '00000000';
export function digestAuthHeader(method, uri, wwwAuthenticate, userpass) {
    // WWW-Authenticate: Digest realm="testrealm@host.com",
    //                       qop="auth,auth-int",
    //                       nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
    //                       opaque="5ccc069c403ebaf9f0171e9517f40e41"
    // Authorization: Digest username="Mufasa",
    //                    realm="testrealm@host.com",
    //                    nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
    //                    uri="/dir/index.html",
    //                    qop=auth,
    //                    nc=00000001,
    //                    cnonce="0a4f113b",
    //                    response="6629fae49393a05397450978507c4ef1",
    //                    opaque="5ccc069c403ebaf9f0171e9517f40e41"
    // HA1 = MD5( "Mufasa:testrealm@host.com:Circle Of Life" )
    //      = 939e7578ed9e3c518a452acee763bce9
    //
    //  HA2 = MD5( "GET:/dir/index.html" )
    //      = 39aff3a2bab6126f332b942af96d3366
    //
    //  Response = MD5( "939e7578ed9e3c518a452acee763bce9:\
    //                   dcd98b7102dd2f0e8b11d0f600bfb0c093:\
    //                   00000001:0a4f113b:auth:\
    //                   39aff3a2bab6126f332b942af96d3366" )
    //           = 6629fae49393a05397450978507c4ef1
    const parts = wwwAuthenticate.split(',');
    const opts = {};
    for (const part of parts) {
        const m = part.match(AUTH_KEY_VALUE_RE);
        if (m) {
            opts[m[1]] = m[2].replace(/["']/g, '');
        }
    }
    if (!opts.realm || !opts.nonce) {
        return '';
    }
    let qop = opts.qop || '';
    const index = userpass.indexOf(':');
    const user = userpass.substring(0, index);
    const pass = userpass.substring(index + 1);
    let nc = String(++NC);
    nc = `${NC_PAD.substring(nc.length)}${nc}`;
    const cnonce = randomBytes(8).toString('hex');
    const ha1 = md5(`${user}:${opts.realm}:${pass}`);
    const ha2 = md5(`${method.toUpperCase()}:${uri}`);
    let s = `${ha1}:${opts.nonce}`;
    if (qop) {
        qop = qop.split(',')[0];
        s += `:${nc}:${cnonce}:${qop}`;
    }
    s += `:${ha2}`;
    const response = md5(s);
    let authstring = `Digest username="${user}", realm="${opts.realm}", nonce="${opts.nonce}", uri="${uri}", response="${response}"`;
    if (opts.opaque) {
        authstring += `, opaque="${opts.opaque}"`;
    }
    if (qop) {
        authstring += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
    }
    return authstring;
}
const MAX_ID_VALUE = Math.pow(2, 31) - 10;
const globalIds = {};
export function globalId(category) {
    if (!globalIds[category] || globalIds[category] >= MAX_ID_VALUE) {
        globalIds[category] = 0;
    }
    return ++globalIds[category];
}
export function performanceTime(startTime, now) {
    return Math.floor(((now ?? performance.now()) - startTime) * 1000) / 1000;
}
export function isReadable(stream) {
    if (typeof Readable.isReadable === 'function')
        return Readable.isReadable(stream);
    // patch from node
    // https://github.com/nodejs/node/blob/1287530385137dda1d44975063217ccf90759475/lib/internal/streams/utils.js#L119
    // simple way https://github.com/sindresorhus/is-stream/blob/main/index.js
    return stream !== null
        && typeof stream === 'object'
        && typeof stream.pipe === 'function'
        && stream.readable !== false
        && typeof stream._read === 'function'
        && typeof stream._readableState === 'object';
}
export function updateSocketInfo(socketInfo, internalOpaque, err) {
    const socket = internalOpaque[symbols.kRequestSocket] ?? err?.[symbols.kErrorSocket];
    if (socket) {
        socketInfo.id = socket[symbols.kSocketId];
        socketInfo.handledRequests = socket[symbols.kHandledRequests];
        socketInfo.handledResponses = socket[symbols.kHandledResponses];
        if (socket[symbols.kSocketLocalAddress]) {
            socketInfo.localAddress = socket[symbols.kSocketLocalAddress];
            socketInfo.localPort = socket[symbols.kSocketLocalPort];
        }
        if (socket.remoteAddress) {
            socketInfo.remoteAddress = socket.remoteAddress;
            socketInfo.remotePort = socket.remotePort;
            socketInfo.remoteFamily = socket.remoteFamily;
        }
        if (Array.isArray(socket.autoSelectFamilyAttemptedAddresses)) {
            socketInfo.attemptedRemoteAddresses = socket.autoSelectFamilyAttemptedAddresses;
        }
        socketInfo.bytesRead = socket.bytesRead;
        socketInfo.bytesWritten = socket.bytesWritten;
        if (socket[symbols.kSocketConnectErrorTime]) {
            socketInfo.connectErrorTime = socket[symbols.kSocketConnectErrorTime];
            socketInfo.connectProtocol = socket[symbols.kSocketConnectProtocol];
            socketInfo.connectHost = socket[symbols.kSocketConnectHost];
            socketInfo.connectPort = socket[symbols.kSocketConnectPort];
        }
        if (socket[symbols.kSocketConnectedTime]) {
            socketInfo.connectedTime = socket[symbols.kSocketConnectedTime];
        }
        if (socket[symbols.kSocketRequestEndTime]) {
            socketInfo.lastRequestEndTime = socket[symbols.kSocketRequestEndTime];
        }
        socket[symbols.kSocketRequestEndTime] = new Date();
    }
}
export function convertHeader(headers) {
    const res = {};
    for (const [key, value] of headers.entries()) {
        if (res[key]) {
            if (!Array.isArray(res[key])) {
                res[key] = [res[key]];
            }
            res[key].push(value);
        }
        else {
            res[key] = value;
        }
    }
    return res;
}
// support require from Node.js 16
export function patchForNode16() {
    if (typeof global.ReadableStream === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.ReadableStream = ReadableStream;
    }
    if (typeof global.TransformStream === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.TransformStream = TransformStream;
    }
    if (typeof global.Blob === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.Blob = Blob;
    }
    if (typeof global.DOMException === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.DOMException = getDOMExceptionClass();
    }
}
// https://github.com/jimmywarting/node-domexception/blob/main/index.js
function getDOMExceptionClass() {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        atob(0);
    }
    catch (err) {
        return err.constructor;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN2QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR25DLE9BQU8sT0FBTyxNQUFNLGNBQWMsQ0FBQztBQUduQyxNQUFNLGVBQWUsR0FBMkI7SUFDOUMsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTO0lBQ3JCLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUztJQUN2QixJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVM7SUFDdEIsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTO0lBQ3RCLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUztJQUN0QixJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVM7SUFDdEIsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTO0NBQ3ZCLENBQUM7QUFDRixtQ0FBbUM7QUFDbkMsTUFBTSxjQUFjLEdBQUcsd0JBQXdCLENBQUM7QUFFaEQsU0FBUyxjQUFjLENBQUMsQ0FBUztJQUMvQixPQUFPLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0YsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsS0FBYTtJQUN4QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENB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