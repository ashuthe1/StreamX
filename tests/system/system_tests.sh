#!/usr/bin/env bash

# usage: ./system_tests.sh [base_url]
base="${1:-http://localhost:3000/api}"

# helper to post JSON and print code
function post() {
  route=$1; shift
  body=$1; shift
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$base/$route" \
    -H "Content-Type: application/json" -d "$body")
  echo "$route -> $code"
}

echo "=== System Test Suite ==="

# 1. Register variations
post register '{"username":"sysuser","password":"pass"}'
post register '{"password":"pass"}'
post register '{"username":"sysuser"}'
post register ''

# 2. Login variations
echo "-- Login tests --"
resp=$(curl -s -X POST "$base/login" -H "Content-Type: application/json" -d '{"username":"sysuser","password":"pass"}')
token=$(echo "$resp" | jq -r .token)
echo "login -> token present: ${token:0:10}..."
post login '{"password":"pass"}'
post login '{"username":"sysuser"}'
# invalid JSON
echo "login invalid-json -> $(curl -s -o /dev/null -w "%{http_code}" -X POST "$base/login" -H "Content-Type: application/json" -d 'invalid')"

# 3. Webhook & history without token
echo "-- Protected endpoint tests --"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$base/hook" -H "Content-Type: application/json" -d '{"msg":"hi"}')
echo "hook no token -> $code"
code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$base/chat-history")
echo "chat-history no token -> $code"

# 4. Webhook & history with token
echo "-- Authenticated tests --"
code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -X POST "$base/hook" -d '{"msg":"hello"}')
echo "hook with token -> $code"
history=$(curl -s -H "Authorization: Bearer $token" -X GET "$base/chat-history")
echo "chat-history with token -> $(echo "$history" | jq length) items"