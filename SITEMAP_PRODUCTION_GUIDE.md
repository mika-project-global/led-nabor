# Sitemap Production Deployment Guide

## Environment Variables Required

Для успешной генерации sitemap на production сервере необходимы следующие переменные окружения:

### Required Variables:

```bash
# Supabase Connection (one of these formats):
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# OR (alternative names, both work):
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### ⚠️ Important Notes:

1. **Use ANON key, NOT service role key**
   - Sitemap generation uses `ANON_KEY` to query published blog posts
   - Service role key is NOT needed and should NOT be exposed to build environment

2. **RLS Policies**
   - Blog posts table MUST have SELECT policy for anonymous users:
     ```sql
     CREATE POLICY "anon can view published blog posts"
       ON blog_posts FOR SELECT TO anon
       USING (published = true);
     ```
   - This policy is already configured in the database

3. **Build Command**
   - Always use: `npm run build:production`
   - This will: generate sitemap → build project → copy sitemap to dist
   - Never use `npm run build` alone (it won't include blog posts)

## Deployment Platforms

### Netlify

Add to Netlify environment variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

Build command:
```
npm run build:production
```

### Vercel

Add to Vercel environment variables (Production):
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

Build command:
```
npm run build:production
```

### Other Platforms

Ensure these environment variables are set in your CI/CD pipeline or build environment.

## Verification After Deploy

### 1. Check Sitemap Exists
```bash
curl https://your-domain.com/sitemap.xml
```

### 2. Count URLs
```bash
curl https://your-domain.com/sitemap.xml | grep -c '<url>'
```

Expected: **88+ URLs** (28 static + 4 categories + 4 products + 52+ blog posts)

### 3. Verify Blog Posts Included
```bash
curl https://your-domain.com/sitemap.xml | grep '/blog/' | head -10
```

Should show blog post URLs like:
- `https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty...`
- `https://led-nabor.com/en/blog/led-ceiling-lighting-guide/`

### 4. Submit to Google Search Console
1. Go to Google Search Console
2. Navigate to Sitemaps section
3. Submit: `https://your-domain.com/sitemap.xml`
4. Wait for Google to crawl (usually 1-3 days)

## Troubleshooting

### Problem: Sitemap has only 36 URLs (missing blog posts)

**Cause:** Environment variables not set or Supabase connection failed

**Solution:**
1. Check environment variables are set correctly
2. Verify ANON key is correct
3. Check build logs for errors:
   ```
   ❌ ERROR: Failed to fetch blog posts from Supabase!
   ```
4. Re-run build with: `npm run build:production`

### Problem: "No published blog posts found"

**Cause:** No published posts in database OR RLS blocking access

**Solution:**
1. Check database: `SELECT COUNT(*) FROM blog_posts WHERE published = true;`
2. Verify RLS policy allows anon access to published posts
3. Test query manually:
   ```sql
   SELECT slug, locale FROM blog_posts WHERE published = true;
   ```

### Problem: Build succeeds but sitemap not in dist

**Cause:** `sitemap:copy` step failed

**Solution:**
1. Check that `public/sitemap.xml` exists before build
2. Run manually: `cp public/sitemap.xml dist/sitemap.xml`
3. Use: `npm run build:production` (not `npm run build`)

## Local Testing

Before deploying, test locally:

```bash
# 1. Generate sitemap
npm run generate-sitemap

# 2. Check it was created successfully
npm run sitemap:check

# 3. Build with sitemap
npm run build:production

# 4. Verify it's in dist
ls -lh dist/sitemap.xml
grep -c '<url>' dist/sitemap.xml

# 5. Preview locally
npm run preview
# Visit: http://localhost:4173/sitemap.xml
```

## Automated Updates

### After Publishing New Blog Posts:

1. New blog post is published in admin panel
2. Next deploy will automatically include it in sitemap
3. No manual sitemap updates needed

### Scheduled Updates:

Consider setting up a scheduled build (e.g., daily) to keep sitemap fresh:

**Netlify:** Build hooks
**Vercel:** Cron jobs
**GitHub Actions:** Scheduled workflows

## Current Statistics

After successful build, you should see:

```
📊 Total URLs: 88

   Breakdown:
   • Static pages:    28
   • Categories:      4
   • Products:        4
   • Blog posts (RU): 27
   • Blog posts (EN): 25
   • Blog posts total: 52
```

If your numbers differ significantly, review this guide and check your database.
