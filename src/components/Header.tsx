import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart as CartIcon, Menu, LogIn, HelpCircle, PenTool, Users, HeadphonesIcon, Shield, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { Cart } from './Cart';
import { Logo } from './Logo';
import { LocaleSwitcher } from './LocaleSwitcher';
import { useLocale } from '../context/LocaleContext';

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { items, removeFromCart, updateQuantity, updateWarranty } = useCart();
  const { formatPrice } = useLocale();
  const { t } = useTranslation();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const dropdownItems = [
    { path: '/blog', icon: BookOpen, label: t('menu.blog') },
    { path: '/business', icon: Users, label: t('menu.for_business') },
    { path: '/warranty', icon: Shield, label: t('menu.warranty') },
    { path: '/faq', icon: HelpCircle, label: t('menu.faq') },
    { path: '/installation-guide', icon: PenTool, label: t('menu.installation_guide') },
    { path: '/about', icon: Users, label: t('menu.about_us') },
    { path: '/support', icon: HeadphonesIcon, label: t('menu.support') }
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <Menu size={24} aria-label={t('menu.home')} />
              </button>
              
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                  role="menu"
                >
                  {dropdownItems.map(({ path, icon: Icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      role="menuitem"
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <div className="border-t my-2" role="separator" />
                  <Link
                    to="/privacy-policy"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                  >
                    {t('privacy_policy')}
                  </Link>
                  <Link
                    to="/terms"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    role="menuitem"
                  >
                    {t('terms_of_use')}
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="cart-button relative p-2 text-gray-700 hover:text-gray-900"
              aria-label={t('menu.cart')}
            >
              <CartIcon size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              to="/auth"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              aria-label={t('menu.home')}
            >
              <LogIn size={24} />
            </Link>
          </div>
        </div>
      </div>
      <Cart
        items={items}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onUpdateWarranty={updateWarranty}
      />
    </header>
  );
}