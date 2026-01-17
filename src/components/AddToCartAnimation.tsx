import React, { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AddToCartAnimationProps {
  children: React.ReactNode;
  onAddToCart: () => void;
  onGoToCheckout: () => void;
}

export function AddToCartAnimation({ children, onAddToCart, onGoToCheckout }: AddToCartAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useTranslation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isAnimating) return;
    setIsAnimating(true);

    const cartButton = document.querySelector('.cart-button');
    if (!cartButton) {
      onAddToCart();
      setIsAnimating(false);
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'cart-success-overlay';
    document.body.appendChild(overlay);

    const message = document.createElement('div');
    message.className = 'cart-success-message';
    message.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="cart-success-icon mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="cart-success-text mb-6">${t('product.added_to_cart')}</div>
        <div class="flex gap-4">
          <button class="cart-continue px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            ${t('continue_shopping')}
          </button>
          <button class="cart-checkout px-6 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">
            ${t('menu.checkout')}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(message);

    const continueBtn = message.querySelector('.cart-continue');
    const checkoutBtn = message.querySelector('.cart-checkout');
    
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        overlay.remove();
        message.remove();
        setIsAnimating(false);
        onAddToCart();
      });
    }
    
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        overlay.remove();
        message.remove();
        setIsAnimating(false);
        onAddToCart();
        onGoToCheckout();
      });
    }
  };

  return (
    <div onClick={handleAddToCart}>
      {React.cloneElement(children as React.ReactElement, {
        disabled: isAnimating,
        className: `${(children as React.ReactElement).props.className} ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`
      })}
    </div>
  );
}