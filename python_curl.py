import socket
import ssl
import sys
from urllib.parse import urlparse

def parse_chunked(data: bytes) -> bytes:
    """Manually parse Transfer-Encoding: chunked HTTP Body"""
    body = bytearray()
    i = 0
    while i < len(data):
        crlf_idx = data.find(b"\r\n", i)
        if crlf_idx == -1: break
        
        # Read hexadecimal chunk size
        size_str = data[i:crlf_idx].split(b";")[0]
        try:
            chunk_size = int(size_str, 16)
        except ValueError:
            break
            
        if chunk_size == 0: # Size 0 indicates the end
            break
            
        start = crlf_idx + 2
        end = start + chunk_size
        body.extend(data[start:end])
        i = end + 2 # Skip trailing \r\n after chunk
        
    return bytes(body)

def my_curl(url: str):
    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port
    scheme = parsed.scheme
    path = parsed.path or "/"
    if parsed.query:
        path += "?" + parsed.query
        
    if not port:
        port = 443 if scheme == "https" else 80
        
    # 1. Establish TCP Socket connection (Transport Layer)
    sock = socket.create_connection((host, port))
    
    # 2. Perform TLS handshake for HTTPS (Encryption Layer)
    if scheme == "https":
        ctx = ssl.create_default_context()
        sock = ctx.wrap_socket(sock, server_hostname=host)
        
    # 3. Assemble raw HTTP request text (Application Layer)
    request_lines = [
        f"GET {path} HTTP/1.1",
        f"Host: {host}",
        "User-Agent: MyRawCurl/1.0",
        "Accept: application/json, */*",
        "Connection: close"
    ]
    request_str = "\r\n".join(request_lines) + "\r\n\r\n"
    
    # 4. Send request (encode string to bytes)
    sock.sendall(request_str.encode("utf-8"))
    
    # 5. Receive server response
    response = b""
    while True:
        chunk = sock.recv(4096)
        if not chunk:
            break
        response += chunk
        
    sock.close()
    
    # 6. Split Headers and Body (\r\n\r\n is the boundary)
    header_data, _, body_data = response.partition(b"\r\n\r\n")
    headers = header_data.decode("utf-8", errors="ignore")
    
    print("=== HTTP Headers ===")
    print(headers)
    print("\n=== HTTP Body ===")
    
    # Process chunked data
    if "Transfer-Encoding: chunked" in headers:
        body = parse_chunked(body_data)
        print(body.decode("utf-8", errors="ignore"))
    else:
        print(body_data.decode("utf-8", errors="ignore"))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python python_curl.py <URL>")
        sys.exit(1)
    my_curl(sys.argv[1])