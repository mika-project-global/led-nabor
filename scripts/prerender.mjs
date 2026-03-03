import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import handler from 'serve-handler';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const port = 3457;

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// All supported locales
const locales = ['en', 'ru', 'de', 'pl', 'cz'];

// Base routes to prerender (locale will be prepended)
// All routes have trailing slash for SEO consistency
const baseRoutes = [
  '/',
  '/catalog/',
  '/product/universal-rgb-cct/',
  '/product/adjustable-white/',
  '/category/rgb_cct/',
  '/category/cct/',
  '/faq/',
  '/about/',
  '/support/',
  '/terms/',
  '/privacy-policy/',
  '/business/',
  '/warranty/',
  '/installation-guide/',
  '/blog/'
];

// Function to fetch all published blog posts from Supabase
async function fetchBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, locale')
      .eq('published', true);

    if (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

// Generate base routes for all locales
function generateBaseRoutes() {
  return locales.flatMap(locale =>
    baseRoutes.map(route => `/${locale}${route}`)
  );
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
      console.log(`✓ Server running at http://localhost:${port}`);
      resolve();
    });
  });

  return server;
}

async function prerenderRoute(browser, route) {
  const url = `http://localhost:${port}${route}`;
  console.log(`Prerendering: ${route}`);

  const page = await browser.newPage();

  try {
    // Set longer timeout for navigation
    page.setDefaultTimeout(90000);

    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 90000
    });

    // Wait for React to render
    await page.waitForSelector('main', { timeout: 20000 });

    // Wait for react-helmet-async to update meta tags AND for blog post alternateUrls to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get the final HTML
    const html = await page.content();

    // Determine output path
    let outputPath;
    // Check if route ends with / or is a locale root (e.g., /en/, /ru/, etc.)
    if (route.match(/^\/[a-z]{2}\/?$/)) {
      // Root locale page like /en/ or /ru/
      const locale = route.replace(/\//g, '');
      outputPath = join(distDir, locale, 'index.html');
    } else if (route.endsWith('/')) {
      outputPath = join(distDir, route, 'index.html');
    } else {
      outputPath = join(distDir, route, 'index.html');
    }

    // Create directory if needed
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML file
    writeFileSync(outputPath, html);
    console.log(`  ✓ Saved: ${outputPath}`);

    // Verify meta tags
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
    console.log(`  ✓ Title: ${title}`);
    if (description) {
      console.log(`  ✓ Description: ${description.substring(0, 60)}...`);
    }

    return { route, success: true, title, description };
  } catch (error) {
    console.error(`  ✗ Error prerendering ${route}:`, error.message);
    return { route, success: false, error: error.message };
  } finally {
    try {
      await page.close();
    } catch (closeError) {
      console.error(`  ⚠️  Error closing page for ${route}`);
    }
  }
}

async function main() {
  console.log('\n🚀 Starting prerendering process...\n');

  // Check if dist exists
  if (!existsSync(distDir)) {
    console.error('❌ Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  let server;
  let browser;

  try {
    // Fetch blog posts from database
    console.log('Fetching blog posts from database...');
    const blogPosts = await fetchBlogPosts();
    console.log(`Found ${blogPosts.length} published blog posts\n`);

    // Generate base routes
    const routes = generateBaseRoutes();

    // Add blog post routes
    blogPosts.forEach(post => {
      routes.push(`/${post.locale}/blog/${post.slug}/`);
    });

    console.log(`Total routes to prerender: ${routes.length}\n`);

    // Start local server
    server = await startServer();

    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    // Prerender all routes
    const results = [];
    for (const route of routes) {
      const result = await prerenderRoute(browser, route);
      results.push(result);
    }

    // Summary
    console.log('\n📊 Prerendering Summary:');
    console.log('========================');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`✓ Successful: ${successful}/${routes.length}`);
    if (failed > 0) {
      console.log(`✗ Failed: ${failed}/${routes.length}`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.route}: ${r.error}`);
      });
    }

    console.log('\n✅ Prerendering complete!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (server) {
      server.close();
    }
  }
}

main();
