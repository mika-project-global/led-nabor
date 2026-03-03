import React, { createContext, useContext, useState } from 'react';

interface BlogTranslationsContextType {
  translations: Record<string, string>; // locale -> url
  setTranslations: (translations: Record<string, string>) => void;
  clearTranslations: () => void;
}

const BlogTranslationsContext = createContext<BlogTranslationsContextType | undefined>(undefined);

export function BlogTranslationsProvider({ children }: { children: React.ReactNode }) {
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const clearTranslations = () => {
    setTranslations({});
  };

  return (
    <BlogTranslationsContext.Provider value={{ translations, setTranslations, clearTranslations }}>
      {children}
    </BlogTranslationsContext.Provider>
  );
}

export function useBlogTranslations() {
  const context = useContext(BlogTranslationsContext);
  if (context === undefined) {
    throw new Error('useBlogTranslations must be used within a BlogTranslationsProvider');
  }
  return context;
}
