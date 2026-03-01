#!/bin/bash
# Quick SEO check script

echo "=== SEO Check for Prerendered Pages ==="
echo ""

check_page() {
  local url=$1
  local file=$2
  
  echo "📄 Checking: $url"
  echo "   File: $file"
  
  if [ ! -f "$file" ]; then
    echo "   ❌ File not found!"
    echo ""
    return
  fi
  
  # Check title
  title=$(grep -o '<title>[^<]*</title>' "$file" | head -1 | sed 's/<title>//;s/<\/title>//')
  if [ -n "$title" ]; then
    echo "   ✓ Title: ${title:0:60}..."
  else
    echo "   ❌ No title found"
  fi
  
  # Check meta description
  desc=$(grep -o 'name="description" content="[^"]*"' "$file" | head -1 | sed 's/name="description" content="//;s/"//')
  if [ -n "$desc" ]; then
    echo "   ✓ Description: ${desc:0:60}..."
  else
    echo "   ❌ No description found"
  fi
  
  # Check OpenGraph
  og_count=$(grep -c 'property="og:' "$file")
  if [ "$og_count" -gt 0 ]; then
    echo "   ✓ OpenGraph: $og_count tags"
  else
    echo "   ❌ No OpenGraph tags"
  fi
  
  # Check Schema.org
  schema_count=$(grep -c 'application/ld+json' "$file")
  if [ "$schema_count" -gt 0 ]; then
    echo "   ✓ Schema.org: $schema_count scripts"
  else
    echo "   ⚠️  No Schema.org JSON-LD"
  fi
  
  echo ""
}

# Check main pages
check_page "/" "dist/index.html"
check_page "/product/1" "dist/product/1/index.html"
check_page "/product/2" "dist/product/2/index.html"
check_page "/category/rgb_cct" "dist/category/rgb_cct/index.html"
check_page "/faq" "dist/faq/index.html"

echo "=== Check Complete ==="
