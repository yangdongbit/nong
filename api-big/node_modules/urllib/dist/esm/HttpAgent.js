import dns from 'node:dns';
import { isIP } from 'node:net';
import { BaseAgent } from './BaseAgent.js';
class IllegalAddressError extends Error {
    hostname;
    ip;
    family;
    constructor(hostname, ip, family) {
        const message = 'illegal address';
        super(message);
        this.name = this.constructor.name;
        this.hostname = hostname;
        this.ip = ip;
        this.family = family;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class HttpAgent extends BaseAgent {
    #checkAddress;
    constructor(options) {
        /* eslint node/prefer-promises/dns: off*/
        const { lookup = dns.lookup, ...baseOpts } = options;
        const lookupFunction = (hostname, dnsOptions, callback) => {
            lookup(hostname, dnsOptions, (err, ...args) => {
                // address will be array on Node.js >= 20
                const address = args[0];
                const family = args[1];
                if (err)
                    return callback(err, address, family);
                if (options.checkAddress) {
                    // dnsOptions.all set to default on Node.js >= 20, dns.lookup will return address array object
                    if (typeof address === 'string') {
                        if (!options.checkAddress(address, family, hostname)) {
                            err = new IllegalAddressError(hostname, address, family);
                        }
                    }
                    else if (Array.isArray(address)) {
                        const addresses = address;
                        for (const addr of addresses) {
                            if (!options.checkAddress(addr.address, addr.family, hostname)) {
                                err = new IllegalAddressError(hostname, addr.address, addr.family);
                                break;
                            }
                        }
                    }
                }
                callback(err, address, family);
            });
        };
        super({
            ...baseOpts,
            connect: { ...options.connect, lookup: lookupFunction, allowH2: options.allowH2 },
        });
        this.#checkAddress = options.checkAddress;
    }
    dispatch(options, handler) {
        if (this.#checkAddress && options.origin) {
            const originUrl = typeof options.origin === 'string' ? new URL(options.origin) : options.origin;
            let hostname = originUrl.hostname;
            // [2001:db8:2de::e13] => 2001:db8:2de::e13
            if (hostname.startsWith('[') && hostname.endsWith(']')) {
                hostname = hostname.substring(1, hostname.length - 1);
            }
            const family = isIP(hostname);
            if (family === 4 || family === 6) {
                // if request hostname is ip, custom lookup won't execute
                if (!this.#checkAddress(hostname, family, hostname)) {
                    throw new IllegalAddressError(hostname, hostname, family);
                }
            }
        }
        return super.dispatch(options, handler);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHR0cEFnZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0h0dHBBZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUM7QUFDM0IsT0FBTyxFQUFrQixJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFNaEQsT0FBTyxFQUFFLFNBQVMsRUFBb0IsTUFBTSxnQkFBZ0IsQ0FBQztBQVc3RCxNQUFNLG1CQUFvQixTQUFRLEtBQUs7SUFDckMsUUFBUSxDQUFTO0lBQ2pCLEVBQUUsQ0FBUztJQUNYLE1BQU0sQ0FBUztJQUVmLFlBQVksUUFBZ0IsRUFBRSxFQUFVLEVBQUUsTUFBYztRQUN0RCxNQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztRQUNsQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLFNBQVUsU0FBUSxTQUFTO0lBQ3RDLGFBQWEsQ0FBd0I7SUFFckMsWUFBWSxPQUF5QjtRQUNuQyx5Q0FBeUM7UUFDekMsTUFBTSxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRXJELE1BQU0sY0FBYyxHQUFtQixDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDeEUsTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxH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