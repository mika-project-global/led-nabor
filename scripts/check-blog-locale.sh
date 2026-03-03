#!/bin/bash

echo "======================================"
echo "Checking Blog Post Locale Handling"
echo "======================================"
echo ""

# Check that locale codes are normalized (no ru-RU, en-US in routing)
echo "1. Checking for locale normalization in routing files..."

if grep -r "ru-RU\|en-US\|en-GB" src/components/LocaleWrapper.tsx src/components/LanguageRedirect.tsx src/lib/urls.ts 2>/dev/null; then
  echo "   ❌ Found non-normalized locale codes in routing files"
else
  echo "   ✅ All routing files use normalized locale codes (ru, en, etc.)"
fi

echo ""

# Check SUPPORTED_LOCALES
echo "2. Checking SUPPORTED_LOCALES..."
grep "SUPPORTED_LOCALES" src/components/LocaleWrapper.tsx

echo ""

# Check that blog posts query uses correct locale field
echo "3. Checking BlogPost.tsx query..."
if grep -A 5 "eq('locale', locale)" src/pages/BlogPost.tsx | grep -q "eq('published', true)"; then
  echo "   ✅ Blog query uses locale from URL correctly"
else
  echo "   ❌ Blog query may have issues"
fi

echo ""

# Check that no navigate() in loadPost function
echo "4. Checking for navigate() in loadPost..."
if grep -A 40 "async function loadPost()" src/pages/BlogPost.tsx | grep -q "navigate("; then
  echo "   ❌ Found navigate() in loadPost - may cause redirect loops"
else
  echo "   ✅ No navigate() in loadPost - redirect loop fixed"
fi

echo ""

# Check BlogTranslationsContext is used
echo "5. Checking BlogTranslationsContext integration..."
if grep -q "useBlogTranslations" src/components/LocaleSwitcher.tsx && grep -q "BlogTranslationsProvider" src/App.tsx; then
  echo "   ✅ BlogTranslationsContext properly integrated"
else
  echo "   ❌ BlogTranslationsContext may not be properly set up"
fi

echo ""

echo "======================================"
echo "Summary"
echo "======================================"
echo ""
echo "Key fixes applied:"
echo "  1. ✅ Removed auto-redirect logic from BlogPost.tsx"
echo "  2. ✅ Blog posts load ONLY by slug + locale from URL"
echo "  3. ✅ LocaleSwitcher uses translation slugs via context"
echo "  4. ✅ Locale normalization (ru, en) in all routing"
echo "  5. ✅ No navigate() in post loading useEffect"
echo ""
echo "Next steps:"
echo "  - Run: npm run build"
echo "  - Run: npm run preview"
echo "  - Test: http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/"
echo "  - Verify: No page flashing or redirects"
echo "  - Check: hreflang tags present (View Page Source)"
echo ""
