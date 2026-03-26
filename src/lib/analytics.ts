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

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof (window as Window & { gtag?: (...a: unknown[]) => void }).gtag === 'function') {
    (window as Window & { gtag: (...a: unknown[]) => void }).gtag(...args);
  }
}

export function trackUserBehavior() {
  window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackEvent('time_on_page', { props: { seconds: timeSpent } });
  });

  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
    );
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      if (maxScroll % 25 === 0) {
        trackEvent('scroll_depth', { props: { depth: maxScroll } });
      }
    }
  });
}

const startTime = Date.now();

export function trackPerformance() {
  if (window.performance) {
    window.addEventListener('load', () => {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      trackEvent('page_load', { props: { milliseconds: loadTime } });
    });
  }
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
}

export function trackViewItem(params: {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  currency: string;
}) {
  gtag('event', 'view_item', {
    currency: params.currency,
    value: params.price / 100,
    items: [{
      item_id: String(params.id),
      item_name: params.name,
      item_category: params.category || 'LED Lighting',
      price: params.price / 100,
      quantity: 1
    }]
  });
}

export function trackAddToCart(params: {
  id: string | number;
  name: string;
  category?: string;
  price: number;
  currency: string;
  quantity?: number;
}) {
  gtag('event', 'add_to_cart', {
    currency: params.currency,
    value: (params.price / 100) * (params.quantity || 1),
    items: [{
      item_id: String(params.id),
      item_name: params.name,
      item_category: params.category || 'LED Lighting',
      price: params.price / 100,
      quantity: params.quantity || 1
    }]
  });
  trackEvent('add_to_cart', { props: { product_id: params.id, product_name: params.name } });
}

export function trackRemoveFromCart(params: {
  id: string | number;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
}) {
  gtag('event', 'remove_from_cart', {
    currency: params.currency,
    value: (params.price / 100) * (params.quantity || 1),
    items: [{
      item_id: String(params.id),
      item_name: params.name,
      item_category: 'LED Lighting',
      price: params.price / 100,
      quantity: params.quantity || 1
    }]
  });
}

export function trackBeginCheckout(params: {
  value: number;
  currency: string;
  items: Array<{ id: string | number; name: string; price: number; quantity: number }>;
}) {
  gtag('event', 'begin_checkout', {
    currency: params.currency,
    value: params.value / 100,
    items: params.items.map(item => ({
      item_id: String(item.id),
      item_name: item.name,
      item_category: 'LED Lighting',
      price: item.price / 100,
      quantity: item.quantity
    }))
  });
  trackEvent('begin_checkout', { props: { value: params.value, currency: params.currency } });
}

export function trackAddPaymentInfo(params: {
  value: number;
  currency: string;
  payment_type: string;
  items: Array<{ id: string | number; name: string; price: number; quantity: number }>;
}) {
  gtag('event', 'add_payment_info', {
    currency: params.currency,
    value: params.value / 100,
    payment_type: params.payment_type,
    items: params.items.map(item => ({
      item_id: String(item.id),
      item_name: item.name,
      item_category: 'LED Lighting',
      price: item.price / 100,
      quantity: item.quantity
    }))
  });
}

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
  gtag('event', 'purchase', {
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency,
    items: params.items.map((item, i) => ({
      item_id: `product_${i}`,
      item_name: item.item_name,
      item_category: 'LED Lighting',
      price: item.price,
      quantity: item.quantity
    }))
  });
  trackEvent('purchase', { props: { value: params.value, currency: params.currency } });
}
