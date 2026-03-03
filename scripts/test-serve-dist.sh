#!/bin/bash

echo "=== Testing dist files with local server ==="
echo ""

# Start serve in background
npx serve dist -l 3000 &
SERVER_PID=$!

sleep 3

echo "Testing EN blog post..."
curl -s -I "http://localhost:3000/en/blog/children-room-lighting-cri-color-rendering/" | head -5

echo ""
echo "Testing RU blog post..."
curl -s -I "http://localhost:3000/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/" | head -5

echo ""
echo "Fetching EN content..."
curl -s "http://localhost:3000/en/blog/children-room-lighting-cri-color-rendering/" | grep -o 'hreflang=' | wc -l | xargs echo "Hreflang tags in EN:"

echo ""
echo "Fetching RU content..."
curl -s "http://localhost:3000/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/" | grep -o 'hreflang=' | wc -l | xargs echo "Hreflang tags in RU:"

# Kill server
kill $SERVER_PID
