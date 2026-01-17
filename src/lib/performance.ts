import { trackEvent } from './analytics';

// Track Core Web Vitals
export function trackWebVitals() {
  if ('web-vital' in window) {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        trackEvent('web_vitals_lcp', {
          props: { value: entry.startTime, rating: entry.startTime < 2500 ? 'good' : 'poor' }
        });
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        trackEvent('web_vitals_fid', {
          props: { value: entry.duration, rating: entry.duration < 100 ? 'good' : 'poor' }
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          trackEvent('web_vitals_cls', {
            props: { value: clsValue, rating: clsValue < 0.1 ? 'good' : 'poor' }
          });
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Optimize image loading
export function optimizeImageLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Preload critical resources
export function preloadCriticalResources() {
  const resources = [
    { type: 'font', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
    { type: 'image', href: '/favicon/favicon-96x96.png' }
  ];

  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = resource.type === 'font' ? 'preload' : 'prefetch';
    link.href = resource.href;
    if (resource.type === 'font') {
      link.as = 'style';
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

// Optimize caching
function setupCaching() {
  if ('caches' in window) {
    caches.open('static-v1').then(cache => {
      cache.addAll([
        '/favicon/favicon-96x96.png',
        '/favicon/apple-touch-icon.png',
        '/favicon/site.webmanifest'
      ]);
    });
  }
}