#!/bin/bash

# Test script to verify hreflang implementation
# Usage: ./scripts/test-hreflang.sh <url>

URL="${1:-http://localhost:5173/en/}"

echo "Testing hreflang tags on: $URL"
echo "========================================="
echo ""

# Fetch page and extract hreflang tags
curl -s "$URL" | grep -o '<link[^>]*hreflang[^>]*>' | while read -r line; do
  # Extract hreflang and href attributes
  hreflang=$(echo "$line" | grep -o 'hreflang="[^"]*"' | cut -d'"' -f2)
  href=$(echo "$line" | grep -o 'href="[^"]*"' | cut -d'"' -f2)

  echo "✓ $hreflang -> $href"
done

echo ""
echo "========================================="
echo "✓ Test complete"
