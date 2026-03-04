# Hreflang Testing Instructions

## Quick Test (Development)

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test with Script
```bash
./scripts/test-hreflang.sh http://localhost:5173/en/
```

Expected output:
```
✓ en -> https://led-nabor.com/en/
✓ ru -> https://led-nabor.com/ru/
✓ de -> https://led-nabor.com/de/
✓ pl -> https://led-nabor.com/pl/
✓ cs -> https://led-nabor.com/cz/
✓ x-default -> https://led-nabor.com/en/
```

### 3. Test Different Pages

Homepage:
```bash
./scripts/test-hreflang.sh http://localhost:5173/en/
```

Product page:
```bash
./scripts/test-hreflang.sh http://localhost:5173/en/product/universal-rgb-cct/
```

Category page:
```bash
./scripts/test-hreflang.sh http://localhost:5173/en/category/rgb-cct/
```

Blog page:
```bash
./scripts/test-hreflang.sh http://localhost:5173/en/blog/
```

## Manual Verification

### In Browser

1. Open any page (e.g., http://localhost:5173/en/)
2. Right-click → "View Page Source" (or press `Ctrl+U`)
3. Search for "hreflang" (`Ctrl+F`)
4. You should see 6 tags:
   - `hreflang="en"`
   - `hreflang="ru"`
   - `hreflang="de"`
   - `hreflang="pl"`
   - `hreflang="cs"` (note: NOT "cz")
   - `hreflang="x-default"`

### Example HTML Output

```html
<link rel="alternate" hreflang="en" href="https://led-nabor.com/en/" />
<link rel="alternate" hreflang="ru" href="https://led-nabor.com/ru/" />
<link rel="alternate" hreflang="de" href="https://led-nabor.com/de/" />
<link rel="alternate" hreflang="pl" href="https://led-nabor.com/pl/" />
<link rel="alternate" hreflang="cs" href="https://led-nabor.com/cz/" />
<link rel="alternate" hreflang="x-default" href="https://led-nabor.com/en/" />
```

## Production Testing

### After Deployment

1. **Test with Google Rich Results Test:**
   - Go to: https://search.google.com/test/rich-results
   - Enter your URL: `https://led-nabor.com/en/`
   - Click "Test URL"
   - Check that hreflang tags are detected

2. **Test with Hreflang Tags Testing Tool:**
   - Go to: https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/
   - Enter your URL
   - Verify all 6 hreflang tags are present
   - Check x-default points to /en/

3. **Google Search Console:**
   - Go to: https://search.google.com/search-console
   - Add property: `led-nabor.com`
   - Wait 1-2 days for indexing
   - Check "International Targeting" → "Language"
   - Verify no hreflang errors

## Checklist

### ✅ Required for All Pages

- [ ] All 5 locale versions present (en, ru, de, pl, cs)
- [ ] x-default points to /en/
- [ ] All URLs use https://
- [ ] All URLs have trailing slash
- [ ] Czech uses "cs" not "cz" in hreflang
- [ ] URLs are absolute (full domain)
- [ ] Canonical URL is present

### ✅ Page-Specific

**Product Pages:**
- [ ] Only includes locales where product slug exists
- [ ] Different slugs for different locales work correctly

**Blog Posts:**
- [ ] Only includes locales where translation exists
- [ ] translation_group_id links posts correctly

**Categories:**
- [ ] All 5 locales present (categories exist on all locales)

**Static Pages:**
- [ ] All 5 locales present

## Common Issues & Solutions

### Issue: No hreflang tags
**Solution:** Check that `alternateUrls` prop is passed to SEO component

### Issue: Only one locale shown
**Solution:** Verify helper function is generating all locales

### Issue: Wrong locale code (cz instead of cs)
**Solution:** Check `localeToHreflang()` function is used

### Issue: URLs without trailing slash
**Solution:** Update helper functions to always add trailing slash

### Issue: Relative URLs instead of absolute
**Solution:** Ensure `SITE_URL` constant is used

## Automated Testing (Future)

Consider adding automated tests:

```typescript
// Example test
describe('Hreflang tags', () => {
  it('should include all 5 locales', () => {
    render(<ProductPage />);
    const hreflangs = document.querySelectorAll('[rel="alternate"][hreflang]');
    expect(hreflangs).toHaveLength(6); // 5 locales + x-default
  });

  it('should convert cz to cs', () => {
    render(<ProductPage />);
    const csTag = document.querySelector('[hreflang="cs"]');
    expect(csTag).toBeTruthy();
    expect(csTag.href).toContain('/cz/');
  });
});
```

## Resources

- [Hreflang Implementation Guide](./HREFLANG_IMPLEMENTATION.md)
- [Sitemap Generation](./SITEMAP_GENERATION.md)
- [Google Hreflang Docs](https://developers.google.com/search/docs/specialty/international/localized-versions)
