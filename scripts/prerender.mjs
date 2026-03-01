import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import handler from 'serve-handler';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const port = 3457;

// Routes to prerender - all with /en/ locale
const routes = [
  '/en/',
  '/en/catalog',
  '/en/product/1',
  '/en/product/2',
  '/en/category/rgb_cct',
  '/en/category/cct',
  '/en/faq',
  '/en/about',
  '/en/warranty',
  '/en/blog'
];

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

    // Wait a bit more for react-helmet-async to update meta tags
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Get the final HTML
    const html = await page.content();

    // Determine output path
    let outputPath;
    if (route === '/en/') {
      outputPath = join(distDir, 'en', 'index.html');
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
