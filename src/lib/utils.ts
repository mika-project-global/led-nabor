// Get the site URL for authentication redirects
export function getURL() {
  let url = __SITE_URL__ ?? 'http://localhost:5173';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure URL doesn't end with a slash
  url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
  return url;
}

// Detect browser language
function detectBrowserLanguage(): string {
  const supportedLanguages = ['cs', 'en', 'de', 'ru', 'uk'];
  
  // Get browser language
  const browserLang = navigator.language.split('-')[0];
  
  // Check if browser language is supported
  if (supportedLanguages.includes(browserLang)) {
    return browserLang;
  }
  
  // Check Accept-Language header
  const languages = navigator.languages;
  for (const lang of languages) {
    const langCode = lang.split('-')[0];
    if (supportedLanguages.includes(langCode)) {
      return langCode;
    }
  }
  
  // Default to Czech
  return 'cs';
}

// Map country code to language and currency
function mapCountryToLocale(countryCode: string): { language: string; currency: string } {
  const mapping: Record<string, { language: string; currency: string }> = {
    // Czech Republic
    CZ: { language: 'cs', currency: 'CZK' },
    // Slovakia
    SK: { language: 'cs', currency: 'EUR' },
    // Germany, Austria
    DE: { language: 'de', currency: 'EUR' },
    AT: { language: 'de', currency: 'EUR' },
    // UK
    GB: { language: 'en', currency: 'GBP' },
    // USA
    US: { language: 'en', currency: 'USD' },
    // Poland
    PL: { language: 'en', currency: 'PLN' },
    // Ukraine
    UA: { language: 'uk', currency: 'UAH' },
    // Russia and other Russian-speaking countries
    RU: { language: 'ru', currency: 'EUR' },
    BY: { language: 'ru', currency: 'EUR' },
    KZ: { language: 'ru', currency: 'EUR' }
  };
  
  return mapping[countryCode] || { language: 'en', currency: 'EUR' };
}