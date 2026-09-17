#!/usr/bin/env bash

echo "=== Running Tests for ts_curl.ts ==="

# Test 1: Fetch single item (200 OK)
echo -n "Test 1 (GET 200 OK): "
OUTPUT=$(npx tsx ts_curl.ts https://jsonplaceholder.typicode.com/posts/1)
if echo "$OUTPUT" | grep -q "200 OK" && echo "$OUTPUT" | grep -q "userId"; then
    echo "PASSED"
else
    echo "FAILED"
fi

# Test 2: Fetch 404 Not Found
echo -n "Test 2 (GET 404 Not Found): "
OUTPUT_404=$(npx tsx ts_curl.ts https://jsonplaceholder.typicode.com/posts/999999)
if echo "$OUTPUT_404" | grep -q "404 Not Found"; then
    echo "PASSED"
else
    echo "FAILED"
fi

echo -n "Test 3 (Python GET 200 OK): "
PY_OUTPUT=$(python3 python_curl.py https://jsonplaceholder.typicode.com/posts/1)
if echo "$PY_OUTPUT" | grep -q "200 OK"; then
    echo "PASSED"
else
    echo "FAILED"
fi

echo "=== All Tests Completed ==="