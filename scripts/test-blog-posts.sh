#!/bin/bash

echo "======================================"
echo "Testing Blog Post Loading"
echo "======================================"
echo ""

# Build the project first
echo "Building project..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build successful"
echo ""

# Start preview server in background
echo "Starting preview server..."
npm run preview > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "Testing blog posts..."
echo ""

# Test RU post
echo "1. Testing RU post: /ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/"
RU_RESPONSE=$(curl -sL -w "%{http_code}" "http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/" -o /tmp/ru-blog-test.html)

if [ "$RU_RESPONSE" = "200" ]; then
  echo "   ✅ Status: 200 OK"

  # Check for hreflang tags
  if grep -q 'hreflang="ru"' /tmp/ru-blog-test.html; then
    echo "   ✅ hreflang RU tag found"
  else
    echo "   ❌ hreflang RU tag missing"
  fi

  if grep -q 'hreflang="en"' /tmp/ru-blog-test.html; then
    echo "   ✅ hreflang EN tag found"
  else
    echo "   ❌ hreflang EN tag missing"
  fi

  # Check for Russian content
  if grep -q "Освещение детской комнаты" /tmp/ru-blog-test.html; then
    echo "   ✅ Russian content found"
  else
    echo "   ❌ Russian content missing"
  fi
else
  echo "   ❌ Status: $RU_RESPONSE"
fi

echo ""

# Test EN post
echo "2. Testing EN post: /en/blog/children-room-lighting-cri-color-rendering/"
EN_RESPONSE=$(curl -sL -w "%{http_code}" "http://localhost:4173/en/blog/children-room-lighting-cri-color-rendering/" -o /tmp/en-blog-test.html)

if [ "$EN_RESPONSE" = "200" ]; then
  echo "   ✅ Status: 200 OK"

  # Check for hreflang tags
  if grep -q 'hreflang="en"' /tmp/en-blog-test.html; then
    echo "   ✅ hreflang EN tag found"
  else
    echo "   ❌ hreflang EN tag missing"
  fi

  if grep -q 'hreflang="ru"' /tmp/en-blog-test.html; then
    echo "   ✅ hreflang RU tag found"
  else
    echo "   ❌ hreflang RU tag missing"
  fi

  # Check for English content
  if grep -q "Children's Room Lighting" /tmp/en-blog-test.html; then
    echo "   ✅ English content found"
  else
    echo "   ❌ English content missing"
  fi
else
  echo "   ❌ Status: $EN_RESPONSE"
fi

echo ""

# Test redirect loop detection (should load without redirects)
echo "3. Testing for redirect loops..."
RU_REDIRECTS=$(curl -sL -w "%{num_redirects}" "http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/" -o /dev/null)

if [ "$RU_REDIRECTS" = "0" ]; then
  echo "   ✅ No redirects detected on RU page"
elif [ "$RU_REDIRECTS" -lt "3" ]; then
  echo "   ⚠️  $RU_REDIRECTS redirect(s) detected (acceptable)"
else
  echo "   ❌ Too many redirects: $RU_REDIRECTS (possible loop)"
fi

echo ""
echo "======================================"
echo "Cleanup"
echo "======================================"

# Kill preview server
kill $SERVER_PID 2>/dev/null

# Cleanup temp files
rm -f /tmp/ru-blog-test.html /tmp/en-blog-test.html

echo "✅ Tests complete"
