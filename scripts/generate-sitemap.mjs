import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SITE_URL = 'https://led-nabor.com';
const LOCALES = ['ru', 'en'];

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const categories = [
  { id: 'rgb_cct', slug: 'rgb-cct' },
  { id: 'cct', slug: 'cct' }
];

const products = [
  {
    id: 1,
    slugs: {
      en: 'universal-rgb-cct',
      ru: 'universal-rgb-cct'
    }
  },
  {
    id: 2,
    slugs: {
      en: 'adjustable-white-cct',
      ru: 'adjustable-white-cct'
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
  console.log('Generating sitemap.xml...');

  const urls = [];

  LOCALES.forEach(locale => {
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/`, new Date(), 'daily', '1.0'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/catalog/`, new Date(), 'daily', '0.9'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/blog/`, new Date(), 'daily', '0.9'));

    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/ceiling-led-lighting/`, new Date(), 'weekly', '0.9'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/led-ceiling-lighting-kit/`, new Date(), 'weekly', '0.9'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/build-your-kit/`, new Date(), 'weekly', '0.8'));

    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/about/`, new Date(), 'monthly', '0.7'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/support/`, new Date(), 'monthly', '0.7'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/installation-guide/`, new Date(), 'monthly', '0.7'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/warranty/`, new Date(), 'monthly', '0.6'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/business/`, new Date(), 'monthly', '0.7'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/faq/`, new Date(), 'monthly', '0.7'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/privacy-policy/`, new Date(), 'yearly', '0.5'));
    urls.push(generateUrlEntry(`${SITE_URL}/${locale}/terms/`, new Date(), 'yearly', '0.5'));
  });

  categories.forEach(category => {
    LOCALES.forEach(locale => {
      urls.push(generateUrlEntry(
        `${SITE_URL}/${locale}/category/${category.slug}/`,
        new Date(),
        'weekly',
        '0.8'
      ));
    });
  });

  products.forEach(product => {
    LOCALES.forEach(locale => {
      const slug = product.slugs[locale] || product.slugs.en;
      urls.push(generateUrlEntry(
        `${SITE_URL}/${locale}/product/${slug}/`,
        new Date(),
        'weekly',
        '0.8'
      ));
    });
  });

  try {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, locale, updated_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
    } else if (blogPosts && blogPosts.length > 0) {
      console.log(`Found ${blogPosts.length} published blog posts`);

      blogPosts.forEach(post => {
        urls.push(generateUrlEntry(
          `${SITE_URL}/${post.locale}/blog/${post.slug}/`,
          post.updated_at,
          'monthly',
          '0.7'
        ));
      });
    }
  } catch (err) {
    console.error('Failed to fetch blog posts:', err);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

  console.log(`✓ Sitemap generated with ${urls.length} URLs`);
  console.log(`✓ Saved to: ${sitemapPath}`);
}

generateSitemap().catch(console.error);
