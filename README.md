# Rebuilding an HTTP Client from the Ground Up (Raw cURL)

This is a `curl`-like project. The goal is not just to call existing APIs, but to **"open the black box"** and use low-level socket connections to reconstruct the true nature of HTTP as a plain-text protocol.

## 💡 Core Learning Goals

1. **Understanding Network Layers:** Bypassing high-level libraries (`requests`/`fetch`) to interact directly with the **Transport Layer (TCP)** and **Encryption Layer (TLS)**.
2. **Handcrafting HTTP Packets:** Understanding that HTTP requests are simply strings formatted with strict `\r\n` line breaks.
3. **Parsing Chunked Formats:** Modern servers often return data using `Transfer-Encoding: chunked`. This project manually decodes the hexadecimal payloads back into the full JSON/text body.

## 🛠 Two Architectures, One Logic

This project provides two versions, using different paradigms to solve the same networking problem:

- **Python Version (`python_curl.py`)**: Uses standard `socket` / `ssl` libraries to demonstrate **Synchronous Blocking** streaming.
- **TypeScript Version (`ts_curl.ts`)**: Uses Node.js low-level `net` / `tls` modules to demonstrate **Asynchronous Event-driven** Buffer handling.

## 🚀 Quick Start

We will use `jsonplaceholder` as our test target:

### Run Python Version

```bash
python python_curl.py [https://jsonplaceholder.typicode.com/posts/1](https://jsonplaceholder.typicode.com/posts/1)
```
