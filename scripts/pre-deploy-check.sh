#!/bin/bash

# Pre-deployment verification script
# Checks all critical aspects before going live

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "          🚀 PRE-DEPLOYMENT VERIFICATION CHECK             "
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check status
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
  fi
}

echo "📋 Checking critical files..."
echo ""

# 1. Check sitemap.xml exists
if [ -f "public/sitemap.xml" ]; then
  check "Sitemap file exists"

  # Count URLs in sitemap
  URL_COUNT=$(grep -c '<loc>' public/sitemap.xml)
  if [ $URL_COUNT -ge 150 ]; then
    echo -e "${GREEN}✓${NC} Sitemap has $URL_COUNT URLs (expected: 150+)"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} Sitemap has only $URL_COUNT URLs (expected: 150+)"
    ((CHECKS_FAILED++))
  fi

  # Check all languages in sitemap
  for lang in ru en uk cz de pl; do
    if grep -q "/$lang/" public/sitemap.xml; then
      echo -e "${GREEN}✓${NC} Language $lang found in sitemap"
      ((CHECKS_PASSED++))
    else
      echo -e "${RED}✗${NC} Language $lang NOT found in sitemap"
      ((CHECKS_FAILED++))
    fi
  done
else
  echo -e "${RED}✗${NC} Sitemap file missing"
  ((CHECKS_FAILED++))
fi

echo ""

# 2. Check robots.txt
if [ -f "public/robots.txt" ]; then
  check "Robots.txt exists"

  if grep -q "Sitemap: https://led-nabor.com/sitemap.xml" public/robots.txt; then
    check "Sitemap URL in robots.txt"
  else
    echo -e "${RED}✗${NC} Sitemap URL missing in robots.txt"
    ((CHECKS_FAILED++))
  fi
else
  echo -e "${RED}✗${NC} Robots.txt missing"
  ((CHECKS_FAILED++))
fi

echo ""

# 3. Check translation files
echo "🌍 Checking translation files..."
echo ""

for lang in en ru uk cz de pl; do
  if [ -f "src/i18n/locales/$lang.json" ]; then
    echo -e "${GREEN}✓${NC} Translation file $lang.json exists"
    ((CHECKS_PASSED++))

    # Check if FAQ section exists
    if grep -q '"faq":' "src/i18n/locales/$lang.json"; then
      echo -e "${GREEN}✓${NC} FAQ section in $lang.json"
      ((CHECKS_PASSED++))
    else
      echo -e "${RED}✗${NC} FAQ section missing in $lang.json"
      ((CHECKS_FAILED++))
    fi
  else
    echo -e "${RED}✗${NC} Translation file $lang.json missing"
    ((CHECKS_FAILED++))
  fi
done

echo ""

# 4. Check environment variables
echo "🔐 Checking environment configuration..."
echo ""

if [ -f ".env" ]; then
  check ".env file exists"

  if grep -q "VITE_SUPABASE_URL" .env; then
    check "Supabase URL configured"
  else
    echo -e "${RED}✗${NC} Supabase URL not configured"
    ((CHECKS_FAILED++))
  fi

  if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    check "Supabase anon key configured"
  else
    echo -e "${RED}✗${NC} Supabase anon key not configured"
    ((CHECKS_FAILED++))
  fi
else
  echo -e "${RED}✗${NC} .env file missing"
  ((CHECKS_FAILED++))
fi

echo ""

# 5. Check build readiness
echo "🔨 Checking build configuration..."
echo ""

if [ -f "package.json" ]; then
  check "package.json exists"

  if grep -q '"build:production"' package.json; then
    check "Production build script configured"
  else
    echo -e "${YELLOW}⚠${NC} Production build script not found (using standard build)"
  fi
else
  echo -e "${RED}✗${NC} package.json missing"
  ((CHECKS_FAILED++))
fi

echo ""

# 6. Check critical pages
echo "📄 Checking critical page files..."
echo ""

CRITICAL_PAGES=(
  "src/pages/FAQ.tsx"
  "src/pages/About.tsx"
  "src/pages/Catalog.tsx"
  "src/pages/Support.tsx"
  "src/pages/Warranty.tsx"
  "src/pages/Blog.tsx"
)

for page in "${CRITICAL_PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo -e "${GREEN}✓${NC} $page exists"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗${NC} $page missing"
    ((CHECKS_FAILED++))
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                      📊 RESULTS                            "
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✓ Passed:${NC} $CHECKS_PASSED"
echo -e "${RED}✗ Failed:${NC} $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}   ✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT! 🚀${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Run: npm run build:production"
  echo "2. Deploy the dist/ folder"
  echo "3. Submit sitemap to search engines"
  echo ""
  echo "See QUICK_DEPLOY_GUIDE.md for detailed instructions."
  echo ""
  exit 0
else
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}   ⚠️  SOME CHECKS FAILED - REVIEW BEFORE DEPLOYING${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Please fix the issues above before deploying."
  echo ""
  exit 1
fi
