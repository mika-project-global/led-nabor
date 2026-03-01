import { Product } from '../types';

type LocaleType = 'en' | 'ru' | 'cz' | 'de' | 'pl';

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
  return `/${locale}`;
}
