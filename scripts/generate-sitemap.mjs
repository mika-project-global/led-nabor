import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SITE_URL = 'https://led-nabor.com';
const LOCALES = ['ru', 'en', 'uk', 'cz', 'de', 'pl'];

const HREFLANG_MAP = {
  ru: 'ru',
  en: 'en',
  uk: 'uk',
  cz: 'cs',
  de: 'de',
  pl: 'pl',
};

console.log('\n🔍 Checking environment variables...');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ ERROR: SUPABASE_URL or VITE_SUPABASE_URL is not set!');
  process.exit(1);
}
if (!SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY is not set!');
  process.exit(1);
}

console.log('✓ Supabase URL:', SUPABASE_URL);
console.log('✓ Supabase Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const categories = [
  { id: 'rgb_cct', slug: 'rgb-cct' },
  { id: 'cct', slug: 'cct' }
];

const products = [
  { id: 1, slugs: { en: 'universal-rgb-cct', ru: 'universal-rgb-cct', uk: 'universal-rgb-cct', cz: 'universal-rgb-cct', de: 'universal-rgb-cct', pl: 'universal-rgb-cct' } },
  { id: 2, slugs: { en: 'adjustable-white-cct', ru: 'adjustable-white-cct', uk: 'adjustable-white-cct', cz: 'adjustable-white-cct', de: 'adjustable-white-cct', pl: 'adjustable-white-cct' } }
];

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function buildHreflangLinks(localeUrlMap) {
  const links = LOCALES
    .filter(locale => localeUrlMap[locale])
    .map(locale => `    <xhtml:link rel="alternate" hreflang="${HREFLANG_MAP[locale]}" href="${localeUrlMap[locale]}"/>`)
    .join('\n');

  const xDefault = localeUrlMap['en'] || localeUrlMap['ru'];
  const xDefaultLink = xDefault
    ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}"/>`
    : '';

  return [links, xDefaultLink].filter(Boolean).join('\n');
}

function generateUrlEntry(loc, lastmod, changefreq, priority, localeUrlMap = null) {
  const lastmodTag = lastmod ? `\n    <lastmod>${formatDate(lastmod)}</lastmod>` : '';
  const hreflang = localeUrlMap ? `\n${buildHreflangLinks(localeUrlMap)}` : '';

  return `  <url>
    <loc>${loc}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflang}
  </url>`;
}

async function generateSitemap() {
  console.log('\n📝 Generating sitemap.xml with hreflang support...\n');

  const urls = [];

  // Static pages — grouped by page path, hreflang across all locales
  console.log('📄 Adding static pages...');
  const staticPages = [
    { path: '', priority: '1.0', freq: 'daily' },
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
    const localeUrlMap = {};
    LOCALES.forEach(locale => {
      localeUrlMap[locale] = `${SITE_URL}/${locale}/${page.path}`;
    });

    LOCALES.forEach(locale => {
      urls.push(generateUrlEntry(
        localeUrlMap[locale],
        new Date(),
        page.freq,
        page.priority,
        localeUrlMap
      ));
    });
  });
  console.log(`   ✓ Added ${staticPages.length * LOCALES.length} static page entries with hreflang`);

  // Category pages
  console.log('📂 Adding category pages...');
  categories.forEach(category => {
    const localeUrlMap = {};
    LOCALES.forEach(locale => {
      localeUrlMap[locale] = `${SITE_URL}/${locale}/category/${category.slug}/`;
    });

    LOCALES.forEach(locale => {
      urls.push(generateUrlEntry(
        localeUrlMap[locale],
        new Date(),
        'weekly',
        '0.8',
        localeUrlMap
      ));
    });
  });
  console.log(`   ✓ Added ${categories.length * LOCALES.length} category entries with hreflang`);

  // Product pages
  console.log('🛍️  Adding product pages...');
  products.forEach(product => {
    const localeUrlMap = {};
    LOCALES.forEach(locale => {
      const slug = product.slugs[locale] || product.slugs.en;
      localeUrlMap[locale] = `${SITE_URL}/${locale}/product/${slug}/`;
    });

    LOCALES.forEach(locale => {
      const slug = product.slugs[locale] || product.slugs.en;
      urls.push(generateUrlEntry(
        `${SITE_URL}/${locale}/product/${slug}/`,
        new Date(),
        'weekly',
        '0.8',
        localeUrlMap
      ));
    });
  });
  console.log(`   ✓ Added ${products.length * LOCALES.length} product entries with hreflang`);

  // Blog posts — group by slug, then emit one <url> per locale with all hreflang links
  console.log('📰 Fetching blog posts from Supabase...');
  try {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, locale, updated_at, published')
      .eq('published', true)
      .order('slug', { ascending: true });

    if (error) {
      console.error('❌ ERROR: Failed to fetch blog posts!', error);
      process.exit(1);
    }

    if (!blogPosts || blogPosts.length === 0) {
      console.warn('⚠️  WARNING: No published blog posts found!');
    } else {
      console.log(`   ✓ Found ${blogPosts.length} published blog post records`);

      // Group by slug
      const slugGroups = {};
      blogPosts.forEach(post => {
        if (!slugGroups[post.slug]) {
          slugGroups[post.slug] = [];
        }
        slugGroups[post.slug].push(post);
      });

      const slugList = Object.keys(slugGroups).sort();
      console.log(`   ✓ Unique slugs: ${slugList.length}`);

      slugList.forEach(slug => {
        const posts = slugGroups[slug];
        const localeUrlMap = {};
        let latestDate = null;

        posts.forEach(post => {
          localeUrlMap[post.locale] = `${SITE_URL}/${post.locale}/blog/${slug}/`;
          if (!latestDate || new Date(post.updated_at) > new Date(latestDate)) {
            latestDate = post.updated_at;
          }
        });

        // Emit one <url> entry per locale that exists for this slug
        LOCALES.forEach(locale => {
          if (localeUrlMap[locale]) {
            urls.push(generateUrlEntry(
              localeUrlMap[locale],
              latestDate,
              'monthly',
              '0.7',
              localeUrlMap
            ));
          }
        });
      });

      console.log(`   ✓ Added ${slugList.length} blog post groups (${slugList.length * LOCALES.length} entries)`);
    }
  } catch (err) {
    console.error('❌ CRITICAL ERROR:', err.message);
    process.exit(1);
  }

  // Write sitemap
  console.log('\n💾 Writing sitemap file...');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ SITEMAP GENERATED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`📊 Total <url> entries: ${urls.length}`);
  console.log(`📁 Saved to: ${sitemapPath}`);
  console.log('='.repeat(60) + '\n');

  return { totalUrls: urls.length };
}

generateSitemap().catch(console.error);
