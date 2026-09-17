# HW01 - Raw cURL Implementation from Scratch

> **University:** National Quemoy University (NQU)  
> **Department:** Computer Science and Information Engineering (CSIE)  
> **Course:** Modern Software Engineering (現代軟體工程)  
> **Student:** 范權榮  
> **Student ID:** 111210557  
> **Repository:** [samdrcr/se-hw1-curl](https://github.com/samdrcr/se-hw1-curl)  
> **Live Showcase:** [https://samdrcr.github.io/se-hw1-curl/](https://samdrcr.github.io/se-hw1-curl/)

---

## 📖 Overview

The goal of this assignment is to "open the black box" of HTTP. Instead of treating network requests as automated magic provided by high-level libraries (`curl`, `requests`, `axios`, or `fetch`), this project reconstructs an HTTP client from first principles using standard operating system sockets.

By assembling and transmitting raw byte streams, the project demonstrates that HTTP/1.1 is simply a structured plain-text protocol running across the transport layer (TCP) and encryption layer (TLS).

---

## 🧱 The Network Stack Model

Modern client tools hide everything below the application level. This project directly interfaces across the middle layers:

```text
┌────────────────────────────────────────────────────────┐
│  Application Layer  : Plain-text HTTP/1.1 Request/Resp │  <-- Hand-crafted strings
├────────────────────────────────────────────────────────┤
│  Security Layer     : TLS 1.2 / 1.3 Encryption         │  <-- Wrapped via ssl / tls
├────────────────────────────────────────────────────────┤
│  Transport Layer    : TCP Stream (Port 80 / 443)       │  <-- Raw Sockets (net / socket)
├────────────────────────────────────────────────────────┤
│  Internet Layer     : IP Routing                       │
└────────────────────────────────────────────────────────┘
```

---

## 🛠 Multi-Language Architectural Comparison

The project provides two independent implementations to demonstrate that network protocols are language-agnostic:

| Feature            | Python Implementation (`python_curl.py`) | TypeScript Implementation (`ts_curl.ts`) |
| :----------------- | :--------------------------------------- | :--------------------------------------- |
| **I/O Model**      | Synchronous, Blocking I/O                | Asynchronous, Event-Driven               |
| **Socket Module**  | Standard library `socket`                | Native Node.js `net`                     |
| **TLS Layer**      | Standard library `ssl.wrap_socket`       | Native Node.js `tls.connect`             |
| **Memory Buffer**  | Python `bytearray` / `bytes`             | Node.js `Buffer` slices                  |
| **Chunk Decoding** | Imperative while-loop slice indexing     | Pointer-based buffer offset scanning     |

---

## 🔍 Deep Dive: What Actually Happens on the Wire?

### 1. Handcrafting the HTTP Request

When executing a request to `https://jsonplaceholder.typicode.com/posts/1`, our client constructs and encodes this byte sequence:

```http
GET /posts/1 HTTP/1.1\r\n
Host: jsonplaceholder.typicode.com\r\n
User-Agent: RawCurl/1.0\r\n
Accept: application/json, */*\r\n
Connection: close\r\n
\r\n
```

- **Request Line:** Contains the HTTP verb (`GET`), path (`/posts/1`), and protocol version (`HTTP/1.1`).
- **Host Header:** Mandatory in HTTP/1.1 to allow Virtual Hosting on multi-tenant web servers.
- **Delimiter:** The final `\r\n\r\n` is required to signal to the server that the request header boundary is complete.

### 2. Decoding `Transfer-Encoding: chunked`

Modern servers often omit a `Content-Length` header when payload sizes are not known in advance, streaming data in chunks instead. The raw frame looks like this:

```text
HTTP/1.1 200 OK\r\n
Content-Type: application/json; charset=utf-8\r\n
Transfer-Encoding: chunked\r\n
\r\n
1bf\r\n
{"userId": 1, "id": 1, ...}\r\n
0\r\n
\r\n
```

Our implementation parses these raw frames manually:

1. Locate the first `\r\n` boundary to extract the hex string (e.g., `1bf`).
2. Parse `1bf` from base-16 into decimal (`447` bytes).
3. Read exactly that many bytes into the output buffer.
4. Continue until a chunk size of `0` is received, marking the end of the stream.

---

## 🚀 Usage & Setup

### Prerequisites

- Python 3.9+
- Node.js v18+

### Running Python Client

```bash
python3 python_curl.py [https://jsonplaceholder.typicode.com/posts/1](https://jsonplaceholder.typicode.com/posts/1)
```

### Running TypeScript Client

```bash
npx tsx ts_curl.ts [https://jsonplaceholder.typicode.com/posts/1](https://jsonplaceholder.typicode.com/posts/1)
```

---

## 📁 Repository Structure

```text
se-hw1-curl/
├── index.html         # GitHub Pages interactive report
├── README.md          # Comprehensive technical documentation
├── python_curl.py     # Python raw socket implementation
├── ts_curl.ts         # TypeScript raw net/tls implementation
├── package.json       # TypeScript dependencies & scripts
└── tsconfig.json      # NodeNext TypeScript compilation settings
```
