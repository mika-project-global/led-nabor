import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[] | string;
  canonicalUrl?: string;
  schema?: object;
}

export function SEO({ title, description, image, type = 'website', keywords, canonicalUrl, schema }: SEOProps) {
  const siteUrl = __SITE_URL__ || 'https://led-nabor.com';
  const defaultImage = '/og-image.jpg';

  const keywordsString = keywords
    ? Array.isArray(keywords)
      ? keywords.join(', ')
      : keywords
    : undefined;

  return (
    <Helmet>
      {/* Basic */}
      <title>{`${title} | ${__APP_NAME__} - LED ленты для подсветки потолка`}</title>
      <meta name="description" content={description} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#0891b2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0891b2" />
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <meta name="google-site-verification" content="your-verification-code" />
      <meta name="yandex-verification" content="your-verification-code" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image || `${siteUrl}${defaultImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content="LED Nabor" />
      <meta property="og:locale" content="cs_CZ" />
      <meta property="og:locale:alternate" content="ru_RU" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="uk_UA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || `${siteUrl}${defaultImage}`} />
      <meta name="twitter:creator" content="@lednabor" />
      <meta name="twitter:site" content="@lednabor" />
      <meta name="twitter:label1" value="Доставка" />
      <meta name="twitter:data1" value="Бесплатно по Европе" />
      <meta name="twitter:label2" value="Гарантия" />
      <meta name="twitter:data2" value="24 месяца" />

      {/* Structured Data */}
      {type === 'product' && schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            ...schema,
            offers: {
              ...schema.offers,
              "@type": "Offer",
              "priceCurrency": "CZK",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          })}
        </script>
      )}

      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: description,
            image: image,
            datePublished: new Date().toISOString(),
            author: {
              "@type": "Organization",
              name: "LED Nabor"
            }
          })}
        </script>
      )}

      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      {/* Schema.org */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      
      {/* Preload critical assets */}
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
    </Helmet>
  );
}