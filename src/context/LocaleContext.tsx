import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LocaleContextType {
  locale: string; // Current locale from URL (source of truth)
  language: string; // Alias for backwards compatibility
  currency: string;
  country: string;
  setLocale: (locale: string) => void;
  setLanguage: (lang: string) => void; // Deprecated, use URL navigation instead
  setCurrency: (curr: string) => void;
  setCountry: (country: string) => void;
  formatPrice: (amount: number) => string;
  detectUserLocale: () => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_CURRENCY = 'CZK';
const DEFAULT_COUNTRY = 'CZ';

const CURRENCY_SYMBOLS: Record<string, string> = {
  CZK: 'Kč',
  EUR: '€',
  USD: '$',
  GBP: '£'
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  // Locale from URL (set by LocaleWrapper) - this is the source of truth
  const [locale, setLocaleState] = useState<string>(DEFAULT_LANGUAGE);

  const [country, setCountryState] = useState<string>(() => {
    const savedCountry = localStorage.getItem('preferredCountry');
    return savedCountry || DEFAULT_COUNTRY;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    return savedCurrency || DEFAULT_CURRENCY;
  });

  const detectUserLocale = async () => {
    // This method is deprecated - locale detection now happens in LanguageRedirect
    console.warn('detectUserLocale is deprecated. Locale is determined by URL.');
  };

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
  };

  // Backwards compatibility method (deprecated - use URL navigation instead)
  const setLanguage = (lang: string) => {
    console.warn('setLanguage is deprecated. Use navigate(`/${locale}/...`) to change language.');
    setLocaleState(lang);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem('preferredCurrency', curr);
  };

  const setCountry = (countryCode: string) => {
    setCountryState(countryCode);
    localStorage.setItem('preferredCountry', countryCode);
  };

  const formatPrice = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return `0 ${CURRENCY_SYMBOLS[currency]}`;
    }

    const roundedAmount = Math.round(amount);
    return `${roundedAmount} ${CURRENCY_SYMBOLS[currency]}`;
  };

  return (
    <LocaleContext.Provider value={{
      locale,
      language: locale, // Alias for backwards compatibility
      currency,
      country,
      setLocale,
      setLanguage,
      setCurrency,
      setCountry,
      formatPrice,
      detectUserLocale
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}