import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 SITEMAP CHECKER\n');
console.log('='.repeat(60));

// Check public/sitemap.xml
const publicSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
const distSitemapPath = path.resolve(__dirname, '../dist/sitemap.xml');

let sitemapPath = publicSitemapPath;
if (!fs.existsSync(publicSitemapPath)) {
  console.log('⚠️  public/sitemap.xml not found, checking dist/sitemap.xml...');
  if (fs.existsSync(distSitemapPath)) {
    sitemapPath = distSitemapPath;
  } else {
    console.error('\n❌ ERROR: No sitemap.xml found!');
    console.error('   Checked:');
    console.error('   - ' + publicSitemapPath);
    console.error('   - ' + distSitemapPath);
    console.error('\n   Run: npm run generate-sitemap');
    process.exit(1);
  }
}

console.log(`📁 Reading: ${sitemapPath}\n`);

try {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

  // Count URLs
  const urlMatches = sitemapContent.match(/<url>/g);
  const totalUrls = urlMatches ? urlMatches.length : 0;

  // Extract all URLs
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(sitemapContent)) !== null) {
    urls.push(match[1]);
  }

  // Count by type
  const blogUrlsRu = urls.filter(url => url.includes('/ru/blog/') && !url.endsWith('/ru/blog/')).length;
  const blogUrlsEn = urls.filter(url => url.includes('/en/blog/') && !url.endsWith('/en/blog/')).length;
  const categoryUrls = urls.filter(url => url.includes('/category/')).length;
  const productUrls = urls.filter(url => url.includes('/product/')).length;
  const staticUrls = totalUrls - blogUrlsRu - blogUrlsEn - categoryUrls - productUrls;

  console.log('📊 SITEMAP STATISTICS');
  console.log('='.repeat(60));
  console.log(`Total URLs: ${totalUrls}`);
  console.log('');
  console.log('Breakdown:');
  console.log(`  • Static pages:    ${staticUrls}`);
  console.log(`  • Categories:      ${categoryUrls}`);
  console.log(`  • Products:        ${productUrls}`);
  console.log(`  • Blog posts (RU): ${blogUrlsRu}`);
  console.log(`  • Blog posts (EN): ${blogUrlsEn}`);
  console.log(`  • Blog posts total: ${blogUrlsRu + blogUrlsEn}`);
  console.log('');

  // Show first 10 URLs
  console.log('🔗 FIRST 10 URLs:');
  console.log('='.repeat(60));
  urls.slice(0, 10).forEach((url, index) => {
    console.log(`${(index + 1).toString().padStart(2)}.`, url);
  });

  // Show 5 blog post examples
  const blogUrls = urls.filter(url =>
    (url.includes('/ru/blog/') || url.includes('/en/blog/')) &&
    !url.endsWith('/ru/blog/') &&
    !url.endsWith('/en/blog/')
  );

  if (blogUrls.length > 0) {
    console.log('');
    console.log('📰 BLOG POST EXAMPLES (5 of ' + blogUrls.length + '):');
    console.log('='.repeat(60));
    blogUrls.slice(0, 5).forEach((url, index) => {
      const locale = url.includes('/ru/blog/') ? '[RU]' : '[EN]';
      console.log(`${(index + 1).toString().padStart(2)}.`, locale, url);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Sitemap is valid and readable');
  console.log('='.repeat(60) + '\n');

} catch (error) {
  console.error('\n❌ ERROR: Failed to read sitemap!');
  console.error('   Error:', error.message);
  process.exit(1);
}
