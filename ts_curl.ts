import * as net from 'net';
import * as tls from 'tls';
import { URL } from 'url';

function parseChunked(buffer: Buffer): Buffer {
    let result = Buffer.alloc(0);
    let offset = 0;
    
    while (offset < buffer.length) {
        const crlf = buffer.indexOf('\r\n', offset);
        if (crlf === -1) break;
        
        // Extract and parse hexadecimal size
        const sizeStr = buffer.subarray(offset, crlf).toString('utf-8').split(';')[0];
        const size = parseInt(sizeStr, 16);
        
        if (size === 0 || isNaN(size)) break; // Size 0 indicates the end
        
        const chunkStart = crlf + 2;
        const chunkEnd = chunkStart + size;
        
        // Concatenate data to result
        result = Buffer.concat([result, buffer.subarray(chunkStart, chunkEnd)]);
        offset = chunkEnd + 2; // Skip trailing \r\n
    }
    return result;
}

function tsCurl(targetUrl: string) {
    const url = new URL(targetUrl);
    const isHttps = url.protocol === 'https:';
    const port = url.port ? parseInt(url.port) : (isHttps ? 443 : 80);
    const host = url.hostname;
    const path = url.pathname + url.search;

    // Assemble string strictly following HTTP/1.1 specs
    const request = [
        `GET ${path} HTTP/1.1`,
        `Host: ${host}`,
        `User-Agent: TSCurl/1.0`,
        `Accept: application/json, */*`,
        `Connection: close`,
        `\r\n`
    ].join('\r\n');

    let responseData = Buffer.alloc(0);

    // Listen for data packet events
    const handleData = (chunk: Buffer) => {
        responseData = Buffer.concat([responseData, chunk]);
    };

    // Process complete data after connection ends
    const handleEnd = () => {
        const splitIdx = responseData.indexOf('\r\n\r\n');
        const headers = responseData.subarray(0, splitIdx).toString('utf-8');
        const body = responseData.subarray(splitIdx + 4);
        
        console.log('=== HTTP Headers ===\n', headers);
        console.log('\n=== HTTP Body ===');
        
        if (headers.toLowerCase().includes('transfer-encoding: chunked')) {
            console.log(parseChunked(body).toString('utf-8'));
        } else {
            console.log(body.toString('utf-8'));
        }
    };

    // Dynamically choose TCP (net) or TLS (tls) based on protocol
    const socketOptions = { host, port };
    const socket = isHttps 
        ? tls.connect({ ...socketOptions, servername: host }, () => socket.write(request))
        : net.createConnection(socketOptions, () => socket.write(request));

    // Bind asynchronous events
    socket.on('data', handleData);
    socket.on('end', handleEnd);
    socket.on('error', console.error);
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log("Usage: npx tsx ts_curl.ts <URL>");
    process.exit(1);
}
tsCurl(args[0]);