import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import handler from 'serve-handler';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const port = 3458;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fetchBlogPosts() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, locale')
    .eq('published', true)
    .order('locale');
  return data || [];
}

async function startServer() {
  const server = createServer((request, response) => {
    return handler(request, response, {
      public: distDir,
      rewrites: [{ source: '**/**', destination: '/index.html' }]
    });
  });

  await new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve();
    });
  });

  return server;
}

async function prerenderBlogPost(page, locale, slug) {
  const url = `http://localhost:${port}/${locale}/blog/${slug}/`;
  console.log(`\nPrerendering: ${url}`);

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  Browser error:', msg.text());
    }
  });

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForSelector('main', { timeout: 10000 }).catch(() => {});

    // Wait for blog post content to render
    await page.waitForSelector('article', { timeout: 10000 }).catch(() => {
      console.log('  ⚠️ Article not found');
    });

    // Wait for loading spinner to disappear
    console.log('  Waiting for content to load...');
    try {
      await page.waitForFunction(
        () => !document.body.textContent.includes('Загрузка...') && !document.body.textContent.includes('Loading...'),
        { timeout: 30000 }
      );
      console.log('  Content loaded!');
    } catch (e) {
      console.log('  ⚠️ Timeout waiting for content, continuing...');
    }

    // Wait extra time for react-helmet-async to update SEO tags
    await new Promise(resolve => setTimeout(resolve, 3000));

    const html = await page.content();

    const outputPath = join(distDir, locale, 'blog', slug, 'index.html');
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html, 'utf-8');

    // Check for hreflang
    const hreflangCount = (html.match(/rel="alternate"\s+hreflang="/g) || []).length;
    const hasCanonical = html.includes('rel="canonical"');

    console.log(`✓ Saved: ${outputPath}`);
    console.log(`  Canonical: ${hasCanonical ? 'YES' : 'NO'}`);
    console.log(`  Hreflang: ${hreflangCount} tags`);

    if (hreflangCount === 0) {
      console.log('  ⚠️ WARNING: No hreflang tags!');
    }

    return { success: true, hreflangCount };
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    return { success: false };
  }
}

async function main() {
  console.log('🚀 Prerendering Blog Posts Only\n');

  const posts = await fetchBlogPosts();
  console.log(`Found ${posts.length} blog posts\n`);

  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const results = [];
  for (const post of posts) {
    // Create fresh page for each post
    const page = await browser.newPage();
    page.setDefaultTimeout(90000);

    const result = await prerenderBlogPost(page, post.locale, post.slug);
    results.push({ ...post, ...result });

    await page.close();
  }

  await browser.close();
  server.close();

  console.log('\n📊 Summary:');
  const withHreflang = results.filter(r => r.success && r.hreflangCount > 0);
  const withoutHreflang = results.filter(r => r.success && r.hreflangCount === 0);
  console.log(`✓ With hreflang: ${withHreflang.length}/${results.length}`);
  console.log(`✗ Without hreflang: ${withoutHreflang.length}/${results.length}`);

  if (withoutHreflang.length > 0) {
    console.log('\n⚠️ Posts without hreflang:');
    withoutHreflang.forEach(r => console.log(`  - ${r.locale}/${r.slug}`));
  }
}

main().catch(console.error);
