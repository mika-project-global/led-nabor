# Sitemap Generation

## Overview

The sitemap is automatically generated from real data:
- Static pages (hardcoded in script)
- Categories from `src/data/categories.ts`
- Products from `src/data/products.ts`
- Blog posts from Supabase database

## Usage

### Generate sitemap

```bash
npm run generate-sitemap
```

This will:
1. Connect to Supabase
2. Fetch all published blog posts
3. Generate sitemap.xml with all URLs
4. Save to `public/sitemap.xml`

### Build with sitemap

```bash
npm run generate-sitemap
npm run build
```

The sitemap will be automatically copied to `dist/sitemap.xml` during build.

## What's included

### 1. Main pages (ru + en)
- `/` - Homepage
- `/catalog/` - Catalog
- `/blog/` - Blog
- `/about/` - About
- `/support/` - Support
- `/installation-guide/` - Installation Guide
- `/warranty/` - Warranty
- `/business/` - Business
- `/faq/` - FAQ

### 2. Categories (ru + en)
- `/category/rgb-cct/`
- `/category/cct/`

### 3. Products (ru + en)
- `/product/universal-rgb-cct/`
- `/product/adjustable-white-cct/`

### 4. Blog posts (from database)
- All published posts with correct locale and slug
- Example: `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`
- Example: `/en/blog/children-room-lighting-cri-color-rendering/`

## Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://led-nabor.com/ru/</loc>
    <lastmod>2026-03-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

## Priorities

- Homepage: 1.0
- Catalog, Blog: 0.9
- Categories, Products: 0.8
- Blog posts, About, Support: 0.7
- Warranty: 0.6

## Update frequency

- Homepage, Catalog, Blog: daily
- Categories, Products: weekly
- Blog posts, static pages: monthly

## Automation

To regenerate sitemap when content changes:

1. **After adding/editing blog posts:**
   ```bash
   npm run generate-sitemap
   ```

2. **After adding products/categories:**
   - Update `scripts/generate-sitemap.mjs`
   - Add new entries to arrays
   - Run `npm run generate-sitemap`

3. **Before deployment:**
   ```bash
   npm run generate-sitemap
   npm run build
   ```

## Current stats

- Total URLs: 30
- Locales: ru, en
- Blog posts: 4 (from database)
- Static pages: 9 per locale
- Categories: 2 per locale
- Products: 2 per locale

## robots.txt

Make sure your `public/robots.txt` includes:

```
User-agent: *
Allow: /

Sitemap: https://led-nabor.com/sitemap.xml
```

## Verification

After deployment, verify at:
- https://led-nabor.com/sitemap.xml
- Google Search Console
- Bing Webmaster Tools
