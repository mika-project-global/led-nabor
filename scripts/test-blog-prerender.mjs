import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createServer } from 'http';
import handler from 'serve-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

config({ path: join(rootDir, '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const distDir = join(rootDir, 'dist');
const port = 3457;

async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, locale')
    .eq('published', true)
    .order('locale', { ascending: true })
    .order('slug', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function startServer() {
  const server = createServer((request, response) => {
    return handler(request, response, {
      public: distDir,
      cleanUrls: false,
      trailingSlash: true
    });
  });

  await new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`✓ Server running at http://localhost:${port}`);
      resolve();
    });
  });

  return server;
}

async function prerenderBlogPost(browser, locale, slug) {
  const url = `http://localhost:${port}/${locale}/blog/${slug}/`;
  console.log(`\nPrerendering: ${url}`);

  const page = await browser.newPage();

  try {
    page.setDefaultTimeout(60000);

    console.log('  → Navigating...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('  → Waiting for main...');
    await page.waitForSelector('main', { timeout: 10000 });

    console.log('  → Waiting 5s for data to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('  → Getting HTML...');
    const html = await page.content();

    const outputPath = join(distDir, locale, 'blog', slug, 'index.html');
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outputPath, html, 'utf-8');
    console.log(`  ✓ Saved: ${outputPath}`);

    // Check for hreflang
    const hreflangCount = (html.match(/rel="alternate"\s+hreflang="/g) || []).length;
    const hasCanonical = html.includes('rel="canonical"');

    console.log(`  ✓ Canonical: ${hasCanonical ? 'YES' : 'NO'}`);
    console.log(`  ✓ Hreflang: ${hreflangCount} link(s)`);

    if (hreflangCount === 0) {
      console.log('  ⚠️  WARNING: No hreflang tags found!');
    }

    return { success: true, hreflangCount, hasCanonical };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🧪 Testing Blog Post Prerendering\n');

  let server;
  let browser;

  try {
    console.log('Fetching blog posts...');
    const blogPosts = await fetchBlogPosts();
    console.log(`Found ${blogPosts.length} published blog posts:\n`);

    blogPosts.forEach(post => {
      console.log(`  - ${post.locale.toUpperCase()}: ${post.slug}`);
    });

    server = await startServer();

    console.log('\nLaunching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const results = [];
    for (const post of blogPosts) {
      const result = await prerenderBlogPost(browser, post.locale, post.slug);
      results.push({ ...post, ...result });
    }

    console.log('\n📊 Summary:');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success && r.hreflangCount > 0);
    const failed = results.filter(r => !r.success);
    const missingHreflang = results.filter(r => r.success && r.hreflangCount === 0);

    console.log(`✓ Successful with hreflang: ${successful.length}/${results.length}`);
    console.log(`✗ Failed: ${failed.length}/${results.length}`);
    console.log(`⚠️  Missing hreflang: ${missingHreflang.length}/${results.length}`);

    if (missingHreflang.length > 0) {
      console.log('\nPosts missing hreflang:');
      missingHreflang.forEach(r => {
        console.log(`  - ${r.locale}/${r.slug}`);
      });
    }

    if (failed.length > 0) {
      console.log('\nFailed posts:');
      failed.forEach(r => {
        console.log(`  - ${r.locale}/${r.slug}: ${r.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
  }
}

main();
