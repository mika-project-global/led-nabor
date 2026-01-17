import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, trackUserBehavior, trackPerformance } from '../lib/analytics';

export function Analytics() {
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      trackUserBehavior();
      trackPerformance();
      initialized.current = true;
    }

    // Отслеживаем просмотр страницы
    trackEvent('pageview', { props: { path: location.pathname } });

    // Отслеживаем взаимодействие с корзиной
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartItems.length > 0) {
      trackEvent('cart_items', { props: { count: cartItems.length } });
    }
  }, [location]);

  return null;
}