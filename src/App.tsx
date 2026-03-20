import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { trackWebVitals, optimizeImageLoading, preloadCriticalResources } from './lib/performance';
import { trackUserInteractions, enhanceAccessibility } from './lib/user-experience';
import { optimizeRendering } from './lib/optimization';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoadingState from './components/LoadingState';
import { Analytics } from './components/Analytics';
import { CookieConsent } from './components/CookieConsent';
import { Notifications } from './components/Notifications';
import { CartProvider } from './context/CartContext';
import { LocaleProvider } from './context/LocaleContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { WarrantyProvider } from './context/WarrantyContext';
import { SiteProvider } from './context/SiteContext';
import { BlogTranslationsProvider } from './context/BlogTranslationsContext';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import { ScrollIndicator } from './components/ScrollIndicator';
import { ScrollToTop } from './components/ScrollToTop';
import { LocaleWrapper } from './components/LocaleWrapper';
import { LanguageRedirect } from './components/LanguageRedirect';

// Lazy load pages
const Catalog = React.lazy(() => import('./pages/Catalog'));
const CategoryProducts = React.lazy(() => import('./pages/CategoryProducts'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const Auth = React.lazy(() => import('./pages/Auth'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Admin = React.lazy(() => import('./pages/Admin'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const InstallationGuide = React.lazy(() => import('./pages/InstallationGuide'));
const Warranty = React.lazy(() => import('./pages/Warranty'));
const Business = React.lazy(() => import('./pages/Business'));
const About = React.lazy(() => import('./pages/About'));
const Support = React.lazy(() => import('./pages/Support'));

// Добавляем недостающие страницы
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const LedCeilingLightingKit = React.lazy(() => import('./pages/LedCeilingLightingKit'));
const CeilingLedLighting = React.lazy(() => import('./pages/CeilingLedLighting'));
const BuildYourKit = React.lazy(() => import('./pages/BuildYourKit'));
const LedCeilingLightingBedroom = React.lazy(() => import('./pages/LedCeilingLightingBedroom'));
const LedCeilingLightingKitchen = React.lazy(() => import('./pages/LedCeilingLightingKitchen'));
const LedCeilingLightingLivingRoom = React.lazy(() => import('./pages/LedCeilingLightingLivingRoom'));
const LedCeilingLightingBathroom = React.lazy(() => import('./pages/LedCeilingLightingBathroom'));
const LedCeilingLightingHallway = React.lazy(() => import('./pages/LedCeilingLightingHallway'));
const LedCeilingLightingOffice = React.lazy(() => import('./pages/LedCeilingLightingOffice'));
const Comparison = React.lazy(() => import('./pages/Comparison'));

// Компонент для редиректа числовых ID
function ProductIdRedirect() {
  const { locale = 'en', '*': maybeId = '' } = useParams();
  const { t } = useTranslation();

  if (maybeId && /^\d+$/.test(maybeId)) {
    return <Navigate to={`/${locale}/product/${maybeId}`} replace />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">{t('common.error', 'Page not found')}</p>
        <Link
          to={`/${locale}/catalog`}
          className="inline-block bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
        >
          {t('nav.catalog', 'Catalog')}
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    trackWebVitals();
    optimizeImageLoading();
    preloadCriticalResources();
    trackUserInteractions();
    enhanceAccessibility();
    optimizeRendering();
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <SiteProvider>
          <WarrantyProvider>
            <LocaleProvider>
              <BlogTranslationsProvider>
                <Router>
                  <CartProvider>
                    <NotificationsProvider>
                      <div className="min-h-screen bg-gray-100">
                        <Header />
                        <Analytics />
                        <CookieConsent />
                        <Notifications />
                        <ScrollIndicator />
                        <ScrollToTop />
                      <Suspense fallback={<LoadingState size="large" />}>
                        <main>
                          <ErrorBoundary>
                            <Routes>
                              {/* Root redirect to user's preferred locale */}
                              <Route path="/" element={<LanguageRedirect />} />

                              {/* Auth callbacks - no locale required */}
                              <Route path="/auth/v1/callback" element={<Auth />} />

                              {/* Locale-based routes */}
                              <Route path="/:locale/*" element={
                                <LocaleWrapper>
                                  <Routes>
                                    <Route path="/" element={<Catalog />} />
                                    <Route path="/catalog" element={<Catalog />} />
                                    <Route path="/product/:productSlug" element={<ProductPage />} />
                                    <Route path="/category/:categoryId" element={<CategoryProducts />} />
                                    <Route path="/faq" element={<FAQ />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/warranty" element={<Warranty />} />
                                    <Route path="/blog" element={<Blog />} />
                                    <Route path="/blog/:slug" element={<BlogPost />} />
                                    <Route path="/auth" element={<Auth />} />
                                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/order-success" element={<OrderSuccess />} />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/installation-guide" element={<InstallationGuide />} />
                                    <Route path="/business" element={<Business />} />
                                    <Route path="/support" element={<Support />} />
                                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                    <Route path="/terms" element={<Terms />} />
                                    <Route path="/led-ceiling-lighting-kit" element={<LedCeilingLightingKit />} />
                                    <Route path="/ceiling-led-lighting" element={<CeilingLedLighting />} />
                                    <Route path="/build-your-kit" element={<BuildYourKit />} />
                                    <Route path="/led-ceiling-lighting-bedroom" element={<LedCeilingLightingBedroom />} />
                                    <Route path="/led-ceiling-lighting-kitchen" element={<LedCeilingLightingKitchen />} />
                                    <Route path="/led-ceiling-lighting-living-room" element={<LedCeilingLightingLivingRoom />} />
                                    <Route path="/led-ceiling-lighting-bathroom" element={<LedCeilingLightingBathroom />} />
                                    <Route path="/led-ceiling-lighting-hallway" element={<LedCeilingLightingHallway />} />
                                    <Route path="/led-ceiling-lighting-office" element={<LedCeilingLightingOffice />} />
                                    <Route path="/comparison" element={<Comparison />} />
                                    {/* Catch-all для неправильных путей и редиректа числовых ID */}
                                    <Route path="/*" element={<ProductIdRedirect />} />
                                  </Routes>
                                </LocaleWrapper>
                              } />
                            </Routes>
                          </ErrorBoundary>
                        </main>
                        <Footer />
                      </Suspense>
                    </div>
                    </NotificationsProvider>
                  </CartProvider>
                </Router>
              </BlogTranslationsProvider>
            </LocaleProvider>
          </WarrantyProvider>
        </SiteProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}