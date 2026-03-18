import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';
import { localeToHreflang } from '../lib/urls';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[] | string;
  canonicalUrl?: string;
  schema?: object;
  alternateUrls?: Record<string, string>;
}

const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  de: 'de_DE',
  pl: 'pl_PL',
  cz: 'cs_CZ',
  ru: 'ru_RU',
  uk: 'uk_UA',
};

export function SEO({ title, description, image, type = 'website', keywords, canonicalUrl, schema, alternateUrls }: SEOProps) {
  const { locale = 'en' } = useParams<{ locale: string }>();
  const location = useLocation();
  const siteUrl = __SITE_URL__ || 'https://led-nabor.com';
  const defaultImage = '/og-image.svg';
  const ogLocale = LOCALE_MAP[locale] || 'en_US';
  const htmlLang = localeToHreflang(locale);

  let fullCanonicalUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  if (!fullCanonicalUrl.endsWith('/')) {
    fullCanonicalUrl += '/';
  }

  const keywordsString = keywords
    ? Array.isArray(keywords)
      ? keywords.join(', ')
      : keywords
    : undefined;

  const defaultAlternateUrl = alternateUrls?.['en'] || `${siteUrl}/en${location.pathname.replace(/^\/(en|ru|uk|cz|de|pl)/, '')}/`;

  const hreflangLinks: Array<Record<string, string>> = [];
  if (alternateUrls) {
    Object.entries(alternateUrls).forEach(([localeKey, url]) => {
      hreflangLinks.push({ rel: 'alternate', hreflang: localeToHreflang(localeKey), href: url });
    });
    hreflangLinks.push({ rel: 'alternate', hreflang: 'x-default', href: defaultAlternateUrl });
  }

  const ogAlternateLocaleMeta: Array<Record<string, string>> = Object.entries(LOCALE_MAP)
    .filter(([key]) => key !== locale)
    .map(([, value]) => ({ property: 'og:locale:alternate', content: value }));

  const linkTags: Array<Record<string, string>> = [
    { rel: 'canonical', href: fullCanonicalUrl },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
    { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
    { rel: 'manifest', href: '/favicon/site.webmanifest' },
    ...hreflangLinks,
  ];

  const metaTags: Array<Record<string, string>> = [
    { name: 'description', content: description },
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#0891b2' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:image', content: image || `${siteUrl}${defaultImage}` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: title },
    { property: 'og:image:type', content: image ? 'image/jpeg' : 'image/svg+xml' },
    { property: 'og:url', content: fullCanonicalUrl },
    { property: 'og:site_name', content: 'LED Nabor' },
    { property: 'og:locale', content: ogLocale },
    ...ogAlternateLocaleMeta,
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image || `${siteUrl}${defaultImage}` },
    { name: 'twitter:creator', content: '@lednabor' },
    { name: 'twitter:site', content: '@lednabor' },
  ];

  if (keywordsString) {
    metaTags.splice(1, 0, { name: 'keywords', content: keywordsString });
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LED Nabor',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon/web-app-manifest-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/favicon/web-app-manifest-512x512.png`,
    sameAs: [
      'https://www.facebook.com/lednabor',
      'https://www.instagram.com/lednabor',
      'https://twitter.com/lednabor',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['en', 'ru', 'uk', 'de', 'pl', 'cs'],
    },
  };

  const productSchema = type === 'product' && schema
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        ...(schema as Record<string, unknown>),
        offers: {
          ...((schema as Record<string, unknown>).offers as Record<string, unknown>),
          '@type': 'Offer',
          priceCurrency: 'CZK',
          availability: 'https://schema.org/InStock',
          priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }
    : null;

  return (
    <Helmet
      htmlAttributes={{ lang: htmlLang }}
      link={linkTags}
      meta={metaTags}
    >
      <title>{`${title} | ${__APP_NAME__} - LED ленты для подсветки потолка`}</title>

      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>

      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}

      {schema && type !== 'product' && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
