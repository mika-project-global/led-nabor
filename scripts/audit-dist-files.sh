#!/bin/bash

echo "=== AUDIT: Prerendered Blog Files ==="
echo ""

FILES=(
  "dist/en/blog/children-room-lighting-cri-color-rendering/index.html"
  "dist/en/blog/can-led-strip-replace-chandelier/index.html"
  "dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html"
  "dist/ru/blog/zamena-lyustry-na-svetodiodnuyu-lentu/index.html"
)

for file in "${FILES[@]}"; do
  echo "---"
  echo "File: $file"

  if [ ! -f "$file" ]; then
    echo "  Status: ❌ NOT FOUND"
    continue
  fi

  echo "  Status: ✓ EXISTS"
  echo "  Size: $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file") bytes"

  # Check for canonical
  canonical_count=$(grep -c 'rel="canonical"' "$file" 2>/dev/null || echo "0")
  if [ "$canonical_count" -gt 0 ]; then
    echo "  Canonical: ✓ YES ($canonical_count)"
  else
    echo "  Canonical: ❌ NO"
  fi

  # Check for hreflang
  hreflang_count=$(grep -c 'hreflang=' "$file" 2>/dev/null || echo "0")
  if [ "$hreflang_count" -gt 0 ]; then
    echo "  Hreflang: ✓ YES ($hreflang_count tags)"
  else
    echo "  Hreflang: ❌ NO"
  fi

  # Check for loading state
  if grep -q "Загрузка\.\.\.\|Loading\.\.\." "$file" 2>/dev/null; then
    echo "  Content: ⚠️  LOADING STATE DETECTED"
  else
    echo "  Content: ✓ LOADED"
  fi

  # Extract title
  title=$(grep -o '<title>[^<]*' "$file" 2>/dev/null | head -1 | cut -d'>' -f2 | cut -c1-70)
  echo "  Title: $title..."

done

echo ""
echo "=== SUMMARY ==="
total=${#FILES[@]}
exists=$(find dist/{en,ru}/blog/*/index.html 2>/dev/null | wc -l)
with_hreflang=$(grep -l 'hreflang=' dist/{en,ru}/blog/*/index.html 2>/dev/null | wc -l)

echo "Total expected: $total"
echo "Files exist: $exists"
echo "With hreflang: $with_hreflang"
