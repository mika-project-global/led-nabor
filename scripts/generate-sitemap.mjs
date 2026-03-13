import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SITE_URL = 'https://led-nabor.com';
const LOCALES = ['ru', 'en', 'uk', 'cz', 'de', 'pl'];

// Validate required environment variables
console.log('\n🔍 Checking environment variables...');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ ERROR: SUPABASE_URL or VITE_SUPABASE_URL environment variable is not set!');
  console.error('   Please set it in your .env file or environment.');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY environment variable is not set!');
  console.error('   Please set it in your .env file or environment.');
  process.exit(1);
}

console.log('✓ Supabase URL:', SUPABASE_URL);
console.log('✓ Supabase Anon Key: ', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const categories = [
  { id: 'rgb_cct', slug: 'rgb-cct' },
  { id: 'cct', slug: 'cct' }
];

const products = [
  {
    id: 1,
    slugs: {
      en: 'universal-rgb-cct',
      ru: 'universal-rgb-cct',
      uk: 'universal-rgb-cct',
      cz: 'universal-rgb-cct',
      de: 'universal-rgb-cct',
      pl: 'universal-rgb-cct'
    }
  },
  {
    id: 2,
    slugs: {
      en: 'adjustable-white-cct',
      ru: 'adjustable-white-cct',
      uk: 'adjustable-white-cct',
      cz: 'adjustable-white-cct',
      de: 'adjustable-white-cct',
      pl: 'adjustable-white-cct'
    }
  }
];

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function generateUrlEntry(loc, lastmod = null, changefreq = 'monthly', priority = '0.8') {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${formatDate(lastmod)}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('\n📝 Generating sitemap.xml...\n');

  const urls = [];
  let staticPagesCount = 0;
  let categoriesCount = 0;
  let productsCount = 0;
  let blogPostsRuCount = 0;
  let blogPostsEnCount = 0;

  // Add static pages
  console.log('📄 Adding static pages...');
  LOCALES.forEach(locale => {
    const staticPages = [
      { path: '', priority: '1.0', freq: 'daily' },  // Home
      { path: 'catalog/', priority: '0.9', freq: 'daily' },
      { path: 'blog/', priority: '0.9', freq: 'daily' },
      { path: 'ceiling-led-lighting/', priority: '0.9', freq: 'weekly' },
      { path: 'led-ceiling-lighting-kit/', priority: '0.9', freq: 'weekly' },
      { path: 'about/', priority: '0.7', freq: 'monthly' },
      { path: 'support/', priority: '0.7', freq: 'monthly' },
      { path: 'installation-guide/', priority: '0.7', freq: 'monthly' },
      { path: 'warranty/', priority: '0.6', freq: 'monthly' },
      { path: 'business/', priority: '0.7', freq: 'monthly' },
      { path: 'faq/', priority: '0.7', freq: 'monthly' },
      { path: 'privacy-policy/', priority: '0.5', freq: 'yearly' },
      { path: 'terms/', priority: '0.5', freq: 'yearly' },
    ];

    staticPages.forEach(page => {
      urls.push(generateUrlEntry(
        `${SITE_URL}/${locale}/${page.path}`,
        new Date(),
        page.freq,
        page.priority
      ));
      staticPagesCount++;
    });
  });
  console.log(`   ✓ Added ${staticPagesCount} static pages (${staticPagesCount / LOCALES.length} pages × ${LOCALES.length} locales)`);

  // Add category pages
  console.log('📂 Adding category pages...');
  categories.forEach(category => {
    LOCALES.forEach(locale => {
      urls.push(generateUrlEntry(
        `${SITE_URL}/${locale}/category/${category.slug}/`,
        new Date(),
        'weekly',
        '0.8'
      ));
      categoriesCount++;
    });
  });
  console.log(`   ✓ Added ${categoriesCount} category pages (${categories.length} categories × ${LOCALES.length} locales)`);

  // Add product pages
  console.log('🛍️  Adding product pages...');
  products.forEach(product => {
    LOCALES.forEach(locale => {
      const slug = product.slugs[locale] || product.slugs.en;
      urls.push(generateUrlEntry(
        `${SITE_URL}/${locale}/product/${slug}/`,
        new Date(),
        'weekly',
        '0.8'
      ));
      productsCount++;
    });
  });
  console.log(`   ✓ Added ${productsCount} product pages (${products.length} products × ${LOCALES.length} locales)`);

  // Fetch and add blog posts from Supabase
  console.log('📰 Fetching blog posts from Supabase...');
  try {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, locale, updated_at, published')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('\n❌ ERROR: Failed to fetch blog posts from Supabase!');
      console.error('   Error details:', error);
      console.error('   This is a CRITICAL error - sitemap will be incomplete without blog posts.');
      console.error('   Check RLS policies and ensure anon users can read published blog posts.');
      process.exit(1);
    }

    if (!blogPosts || blogPosts.length === 0) {
      console.warn('\n⚠️  WARNING: No published blog posts found in database!');
      console.warn('   Sitemap will not include any blog post URLs.');
      console.warn('   If this is unexpected, check your database for published posts.');
    } else {
      console.log(`   ✓ Found ${blogPosts.length} published blog posts`);

      blogPosts.forEach(post => {
        urls.push(generateUrlEntry(
          `${SITE_URL}/${post.locale}/blog/${post.slug}/`,
          post.updated_at,
          'monthly',
          '0.7'
        ));

        if (post.locale === 'ru') {
          blogPostsRuCount++;
        } else if (post.locale === 'en') {
          blogPostsEnCount++;
        }
      });

      console.log(`   ✓ Added ${blogPostsRuCount} RU blog posts`);
      console.log(`   ✓ Added ${blogPostsEnCount} EN blog posts`);
    }
  } catch (err) {
    console.error('\n❌ CRITICAL ERROR: Exception while fetching blog posts!');
    console.error('   Exception:', err.message);
    console.error('   Stack:', err.stack);
    console.error('\n   This means the Supabase connection failed completely.');
    console.error('   Check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
  }

  // Generate sitemap XML
  console.log('\n💾 Writing sitemap file...');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ SITEMAP GENERATED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`📊 Total URLs: ${urls.length}`);
  console.log('');
  console.log('   Breakdown:');
  console.log(`   • Static pages:    ${staticPagesCount}`);
  console.log(`   • Categories:      ${categoriesCount}`);
  console.log(`   • Products:        ${productsCount}`);
  console.log(`   • Blog posts (RU): ${blogPostsRuCount}`);
  console.log(`   • Blog posts (EN): ${blogPostsEnCount}`);
  console.log(`   • Blog posts total: ${blogPostsRuCount + blogPostsEnCount}`);
  console.log('');
  console.log(`📁 Saved to: ${sitemapPath}`);
  console.log('='.repeat(60) + '\n');

  return {
    totalUrls: urls.length,
    blogPostsRu: blogPostsRuCount,
    blogPostsEn: blogPostsEnCount
  };
}

generateSitemap().catch(console.error);
