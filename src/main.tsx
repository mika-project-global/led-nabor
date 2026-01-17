import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n';
import './index.css';

// Add language attribute to HTML tag based on user's language
const setHtmlLang = () => {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage) {
    document.documentElement.lang = savedLanguage;
  } else {
    // Default to English
    document.documentElement.lang = 'en';
  }
};

// Set language attribute
setHtmlLang();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);