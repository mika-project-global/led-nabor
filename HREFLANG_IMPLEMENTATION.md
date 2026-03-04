# Hreflang Implementation Guide

## Overview

All pages on the site now automatically include hreflang tags for international SEO. This helps search engines understand which language version to show to users based on their location and language preferences.

## Supported Locales

The site supports 5 locales:
- **en** (English) - x-default
- **ru** (Russian)
- **de** (German)
- **pl** (Polish)
- **cs** (Czech) - stored as 'cz' in the app, but outputted as 'cs' in hreflang

## Implementation

### SEO Component

The `SEO` component (`src/components/SEO.tsx`) automatically generates hreflang tags when `alternateUrls` prop is provided:

```tsx
<SEO
  title="Page Title"
  description="Page description"
  alternateUrls={{
    en: 'https://led-nabor.com/en/page/',
    ru: 'https://led-nabor.com/ru/page/',
    de: 'https://led-nabor.com/de/page/',
    pl: 'https://led-nabor.com/pl/page/',
    cz: 'https://led-nabor.com/cz/page/'
  }}
/>
```

This generates:
```html
<link rel="alternate" hreflang="en" href="https://led-nabor.com/en/page/" />
<link rel="alternate" hreflang="ru" href="https://led-nabor.com/ru/page/" />
<link rel="alternate" hreflang="de" href="https://led-nabor.com/de/page/" />
<link rel="alternate" hreflang="pl" href="https://led-nabor.com/pl/page/" />
<link rel="alternate" hreflang="cs" href="https://led-nabor.com/cz/page/" />
<link rel="alternate" hreflang="x-default" href="https://led-nabor.com/en/page/" />
```

Note: `cz` is automatically converted to `cs` for hreflang (Czech language code).

## Helper Functions

All helper functions are in `src/lib/urls.ts`:

### 1. Static Pages (Homepage, About, FAQ, etc.)

```typescript
import { getStaticPageAlternateUrls } from '../lib/urls';

const alternateUrls = getStaticPageAlternateUrls('/about');
// Returns all 5 locale versions of the page
```

### 2. Product Pages

```typescript
import { getProductAlternateUrls } from '../lib/urls';

const alternateUrls = getProductAlternateUrls(product);
// Only includes locales where product slug exists
```

### 3. Category Pages

```typescript
import { getCategoryAlternateUrls } from '../lib/urls';

const alternateUrls = getCategoryAlternateUrls(categoryId);
// Returns all 5 locale versions
```

### 4. Blog Posts

```typescript
// Blog posts load alternate URLs from database
// Based on translation_group_id
const { data } = await supabase
  .from('blog_posts')
  .select('slug, locale')
  .eq('translation_group_id', translationGroupId);

const alternates: Record<string, string> = {};
data.forEach(translation => {
  alternates[translation.locale] = `${SITE_URL}/${translation.locale}/blog/${translation.slug}/`;
});
```

## Pages with Hreflang

### ✅ Implemented

- Homepage (`/`)
- Catalog (`/catalog`)
- Category pages (`/category/{id}`)
- Product pages (`/product/{slug}`)
- Blog (`/blog`)
- Blog posts (`/blog/{slug}`)
- About (`/about`)
- Support (`/support`)
- Installation Guide (`/installation-guide`)
- Warranty (`/warranty`)
- Business (`/business`)
- FAQ (`/faq`)
- Terms (`/terms`)
- Privacy Policy (`/privacy-policy`)

### ❌ Not Implemented (Should Not Have Hreflang)

- Admin pages
- Auth pages (login/signup)
- Profile
- Checkout
- Order Success (session-specific)
- Reset Password

## Testing

### 1. View Source

Open any page and view source (`Ctrl+U` or `Cmd+U`). Look for:

```html
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="ru" href="..." />
<link rel="alternate" hreflang="de" href="..." />
<link rel="alternate" hreflang="pl" href="..." />
<link rel="alternate" hreflang="cs" href="..." />
<link rel="alternate" hreflang="x-default" href="..." />
```

### 2. Google Search Console

After deployment:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Navigate to "International Targeting" → "Language"
3. Verify no hreflang errors

### 3. Hreflang Testing Tools

- [Hreflang Tags Testing Tool](https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/)
- [Merkle's Hreflang Tag Testing Tool](https://technicalseo.com/tools/hreflang/)

## Best Practices

### ✅ Do

- Always include trailing slash in URLs
- Use absolute URLs (full domain)
- Include x-default pointing to /en/
- Use canonical URL along with hreflang
- Include all available locale versions

### ❌ Don't

- Use relative URLs
- Mix http and https
- Forget trailing slashes
- Include non-existent pages
- Use hreflang for content behind auth

## Common Issues

### Issue: Missing hreflang tags

**Solution:** Make sure you're passing `alternateUrls` to the `SEO` component.

### Issue: Wrong locale code (cz instead of cs)

**Solution:** The `localeToHreflang()` function automatically converts `cz` to `cs`. Check that it's being used.

### Issue: x-default not working

**Solution:** Verify that English URL is included in alternateUrls and is being set as default.

## Sitemap Integration

The sitemap (`public/sitemap.xml`) includes all URLs with proper locale prefixes:

```xml
<url>
  <loc>https://led-nabor.com/ru/product/universal-rgb-cct/</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://led-nabor.com/en/product/universal-rgb-cct/</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

This works together with hreflang tags to help search engines understand the site structure.

## SEO Impact

Proper hreflang implementation helps with:
- ✅ Showing correct language version in search results
- ✅ Avoiding duplicate content issues
- ✅ Improving user experience for international visitors
- ✅ Better ranking in local search results
- ✅ Reduced bounce rate from wrong language

## Maintenance

When adding new pages:

1. **Static pages:** Use `getStaticPageAlternateUrls('/new-page')`
2. **Products:** Use `getProductAlternateUrls(product)`
3. **Categories:** Use `getCategoryAlternateUrls(categoryId)`
4. **Blog posts:** Load from database by translation_group_id

Always pass `alternateUrls` to the `SEO` component.

## Resources

- [Google Hreflang Documentation](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Hreflang Best Practices](https://support.google.com/webmasters/answer/189077)
- [International SEO Guide](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
