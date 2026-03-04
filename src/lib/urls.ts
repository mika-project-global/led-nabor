import { Product } from '../types';

type LocaleType = 'en' | 'ru' | 'cz' | 'de' | 'pl';

export const SUPPORTED_LOCALES: LocaleType[] = ['en', 'ru', 'cz', 'de', 'pl'];
export const SITE_URL = 'https://led-nabor.com';

/**
 * Generate product URL with localized slug
 */
export function getProductUrl(locale: string, product: Product): string {
  const currentLocale = locale as LocaleType;
  const slug = product.slugs[currentLocale];
  return `/${locale}/product/${slug}`;
}

/**
 * Generate category URL
 */
export function getCategoryUrl(locale: string, categoryId: string): string {
  return `/${locale}/category/${categoryId}`;
}

/**
 * Generate home URL for locale
 */
export function getHomeUrl(locale: string): string {
  return `/${locale}/`;
}

/**
 * Generate alternate URLs for hreflang tags
 * For product pages - checks if slug exists for each locale
 * Always includes trailing slash for consistency
 */
export function getProductAlternateUrls(product: Product): Record<string, string> {
  const alternates: Record<string, string> = {};

  SUPPORTED_LOCALES.forEach(locale => {
    if (product.slugs[locale]) {
      alternates[locale] = `${SITE_URL}/${locale}/product/${product.slugs[locale]}/`;
    }
  });

  return alternates;
}

/**
 * Generate alternate URLs for static pages (home, about, faq, etc.)
 * These pages exist on all locales
 * Always includes trailing slash for consistency
 */
export function getStaticPageAlternateUrls(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};

  // Ensure path starts with / unless it's empty (for home page)
  let normalizedPath = path === '' ? '/' : (path.startsWith('/') ? path : `/${path}`);

  // Add trailing slash if not present (except for home page which is just '/')
  if (normalizedPath !== '/' && !normalizedPath.endsWith('/')) {
    normalizedPath += '/';
  }

  SUPPORTED_LOCALES.forEach(locale => {
    alternates[locale] = `${SITE_URL}/${locale}${normalizedPath}`;
  });

  return alternates;
}

/**
 * Generate alternate URLs for blog posts
 * Checks if post exists for each locale
 * Always includes trailing slash for consistency
 */
export function getBlogPostAlternateUrls(slug: string, availableLocales: LocaleType[]): Record<string, string> {
  const alternates: Record<string, string> = {};

  availableLocales.forEach(locale => {
    alternates[locale] = `${SITE_URL}/${locale}/blog/${slug}/`;
  });

  return alternates;
}

/**
 * Generate alternate URLs for category pages
 * Categories exist on all locales
 * Always includes trailing slash for consistency
 */
export function getCategoryAlternateUrls(categoryId: string): Record<string, string> {
  const alternates: Record<string, string> = {};

  SUPPORTED_LOCALES.forEach(locale => {
    alternates[locale] = `${SITE_URL}/${locale}/category/${categoryId}/`;
  });

  return alternates;
}

/**
 * Convert locale code to hreflang format
 * cz -> cs (Czech Republic uses 'cs' in hreflang)
 */
export function localeToHreflang(locale: string): string {
  if (locale === 'cz') return 'cs';
  return locale;
}
