import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: 'naborgotov.cz',
  trackLocalhost: true,
  apiHost: 'https://plausible.io'
});

export const {   } = plausible;

interface EventOptions {
  props?: Record<string, string | number | boolean>;
}

export function trackEvent(eventName: string, options?: EventOptions) {
  plausible.trackEvent(eventName, { props: options?.props });
}

// Отслеживание поведения пользователя
export function trackUserBehavior() {
  // Время на странице
  let startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackEvent('time_on_page', { props: { seconds: timeSpent } });
  });

  // Глубина скролла
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
    );
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      if (maxScroll % 25 === 0) { // Отслеживаем каждые 25%
        trackEvent('scroll_depth', { props: { depth: maxScroll } });
      }
    }
  });
}

// Отслеживание производительности
export function trackPerformance() {
  if (window.performance) {
    window.addEventListener('load', () => {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      trackEvent('page_load', { props: { milliseconds: loadTime } });
    });
  }
}

// Отправка события покупки в Google Analytics 4
interface PurchaseItem {
  item_name: string;
  quantity: number;
  price: number;
}

interface PurchaseEventParams {
  transaction_id: string;
  value: number;
  currency: string;
  items: PurchaseItem[];
}

export function trackPurchase(params: PurchaseEventParams) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency,
      items: params.items
    });

    console.log('GA4 Purchase event sent:', params);
  } else {
    console.warn('gtag is not available for tracking purchase');
  }
}