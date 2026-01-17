import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LocaleContextType {
  language: string;
  currency: string;
  country: string;
  setLanguage: (lang: string) => void;
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

  const [language, setLanguageState] = useState<string>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || DEFAULT_LANGUAGE;
  });

  const [country, setCountryState] = useState<string>(() => {
    const savedCountry = localStorage.getItem('preferredCountry');
    return savedCountry || DEFAULT_COUNTRY;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    return savedCurrency || DEFAULT_CURRENCY;
  });

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      document.documentElement.lang = language;
    }
  }, [language, i18n]);

  const detectUserLocale = async () => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const supportedLangs = ['en', 'ru'];
      const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'en';
      setLanguage(detectedLang);
    }
  };

  useEffect(() => {
    detectUserLocale();
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
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
      language,
      currency,
      country,
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