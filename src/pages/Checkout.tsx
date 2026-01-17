import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { createCashOnDeliveryOrder, createCheckoutSession } from '../lib/stripe-checkout';
import { getCurrentUser } from '../lib/supabase-auth';
import { CreditCard, Truck, ChevronRight, Package, ChevronLeft, Banknote, Info, Shield, CreditCard as CardIcon, Minus, Plus } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { CustomerInfo, DeliveryMethod, PaymentMethod, Order } from '../types';
import { supabase } from '../lib/supabase';
import { getImageUrl } from '../lib/supabase-storage';
import { useNotifications } from '../hooks/useNotifications';
import { SEO } from '../components/SEO';

// Helper function to create a serializable order item
const createSerializableOrderItem = (item: any) => ({
  id: item.id,
  name: item.name,
  quantity: item.quantity,
  variant: {
    id: item.variant.id,
    price: item.variant.price,
    length: item.variant.length,
    stripePriceId: item.variant.stripePriceId
  },
  warranty: item.warranty ? {
    policyId: item.warranty.policyId,
    months: item.warranty.months,
    additionalCost: item.warranty.additionalCost,
    stripePriceId: item.warranty.stripePriceId
  } : undefined,
  adapter: item.adapter,
  image: item.image
});

// Helper function to create a serializable payment method
const createSerializablePaymentMethod = (method: PaymentMethod) => ({
  id: method.id,
  name: method.name,
  type: method.type
  // Exclude the icon property as it's a React component
});

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, updateQuantity } = useCart();
  const { formatPrice } = useLocale();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  const [step, setStep] = useState<'info' | 'delivery' | 'confirmation'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card'>('cash');
  
  const total = items.reduce((sum, item) => {
    let itemTotal = (item.variant.price + (item.warranty?.additionalCost || 0)) * item.quantity;
    if (item.adapter) {
      itemTotal += 200 * item.quantity; // 200 CZK per adapter (or equivalent in other currencies)
    }
    return sum + itemTotal;
  }, 0);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'CZ'
    }
  });

  // Load user profile data if available
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { user, error } = await getCurrentUser();
        
        if (error) {
          if (error.name === 'AuthSessionMissingError') {
            // User is not authenticated - this is fine, continue as guest
            setIsAuthenticated(false);
            setIsLoadingProfile(false);
            return;
          }
          throw error;
        }

        setIsAuthenticated(true);
        if (user?.profile) {
          // Auto-fill form with user profile data
          setCustomerInfo({
            email: user.profile.email || '',
            firstName: user.profile.full_name?.split(' ')[0] || '',
            lastName: user.profile.full_name?.split(' ').slice(1).join(' ') || '',
            phone: user.profile.phone || '',
            address: {
              street: user.profile.address?.street || '',
              city: user.profile.address?.city || '',
              postalCode: user.profile.address?.postal_code || '',
              country: user.profile.address?.country || 'CZ'
            }
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  const [selectedDelivery] = useState<DeliveryMethod>({
    id: 'free_eu_delivery',
    name: t('checkout.free_delivery'),
    price: 0,
    currency: 'EUR',
    estimatedDays: '3-7'
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: t('checkout.pay_on_delivery'),
      type: 'cash',
      icon: <Banknote size={20} className="text-green-600" />
    },
    {
      id: 'card',
      name: t('checkout.pay_with_card'),
      type: 'card',
      icon: <CardIcon size={20} className="text-blue-600" />
    }
  ];

  const selectedPaymentMethodObj = paymentMethods.find(method => method.id === selectedPaymentMethod) || paymentMethods[0];

  const handleBack = () => {
    setError(null);
    switch (step) {
      case 'delivery':
        setStep('info');
        break;
      case 'confirmation':
        setStep('delivery');
        break;
    }
  };

  const handleCustomerInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('delivery');
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    if (!total) {
      setError('Error: Order total cannot be zero');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create serializable order items
      const serializableItems = items.map(createSerializableOrderItem);

      try {
        // Create serializable payment method
        const serializablePaymentMethod = createSerializablePaymentMethod(selectedPaymentMethodObj);

        // Create order in database with serializable data
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            customer_info: customerInfo,
            items: serializableItems,
            total: Number(total),
            delivery_method: selectedDelivery,
            payment_method: serializablePaymentMethod,
            status: "pending",
            user_id: isAuthenticated ? (await getCurrentUser()).user?.id : null
          })
          .select()
          .single();
        
        if (orderError) throw orderError;

        // Get the product from the database
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('stripeProductId')
          .eq('id', items[0]?.id)
          .single();

        if (productError) {
          console.error('Error fetching product data:', productError);
        }
        
        const stripeProductId = productData?.stripeProductId;

        const order: Order = {
          id: orderData.id,
          items: serializableItems,
          total,
          customerInfo,
          deliveryMethod: selectedDelivery,
          paymentMethod: serializablePaymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
          stripeProductId,
          userId: isAuthenticated ? (await getCurrentUser()).user?.id : null
        };

        if (selectedPaymentMethod === 'cash') {
          // Cash on delivery flow
          await createCashOnDeliveryOrder(order);
          showNotification('success', 'Order placed successfully!'); 
          navigate('/order-success');
          clearCart();
        } else if (selectedPaymentMethod === 'card') {
          // Card payment flow with Stripe
          const { id, error } = await createCheckoutSession(order);
          if (error) {
            console.error('Error creating checkout session:', error);
            throw new Error(error);
          }

          // If we reach here, the checkout was successful but the redirect hasn't happened yet
          showNotification('info', 'Redirecting to payment...'); 
        }
      } catch (error) {
        console.error('Error processing order:', error.message || error);
        setError(typeof error === 'string' ? error : 
                (error.message || 'An error occurred while processing your order'));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating order:', error.message || error);
      setError(typeof error === 'string' ? error : 
              (error.message || 'An error occurred while creating your order'));
      setIsSubmitting(false);
    } finally {
      // Don't set isSubmitting to false here for card payments
      // as we're redirecting to Stripe
      if (selectedPaymentMethod === 'cash') {
        setIsSubmitting(false);
      }
    }
  };

  // Function to handle quantity changes
  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
          <Link to="/" className="text-cyan-500 hover:text-cyan-600">
            {t('continue_shopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={t('checkout.title')}
        description={t('checkout.description')}
      />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {step !== 'info' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft size={20} />
              {t('back')}
            </button>
          )}
          <h1 className="text-3xl font-bold">{t('menu.checkout')}</h1>
        </div>
        <div className="flex items-center gap-2">
          {['info', 'delivery', 'confirmation'].map((s, index) => (
            <React.Fragment key={s}>
              <div
                className={`w-3 h-3 rounded-full ${
                  step === s ? 'bg-cyan-500' : 'bg-gray-300'
                }`}
              />
              {index < 2 && <ChevronRight className="text-gray-400\" size={16} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'info' && (
            <form onSubmit={handleCustomerInfoSubmit} className="bg-white rounded-lg p-6 shadow-lg relative">
              {isLoadingProfile && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <h2 className="text-xl font-bold mb-6">{t('checkout.customer_info')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.first_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.last_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.phone')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.street')}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address.street}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, street: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.city')}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address.city}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, city: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.postal_code')}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.address.postalCode}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: { ...customerInfo.address, postalCode: e.target.value }
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                {t('checkout.continue_to_delivery')}
              </button>
            </form>
          )}

          {step === 'delivery' && (
            <form onSubmit={handleDeliverySubmit} className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6">{t('checkout.delivery_method')}</h2>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <Truck size={24} className="text-cyan-600" />
                  <div>
                    <h3 className="font-medium">{t('checkout.free_delivery')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('checkout.delivery_time')}
                    </p>
                  </div>
                  <Info
                    size={20}
                    className="text-cyan-600 ml-auto cursor-help"
                    title={t('checkout.delivery_cost_included')}
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4">{t('checkout.payment_method')}</h2>
              <div className="space-y-3 mb-6">
                {paymentMethods.map(method => (
                  <label 
                    key={method.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id 
                        ? 'border-cyan-500 bg-cyan-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => setSelectedPaymentMethod(method.id as 'cash' | 'card')}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      {method.icon}
                      <span className="font-medium">{method.name}</span>
                      {method.id === 'card' && (
                        <div className="ml-auto flex gap-2">
                          <img src="https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/visa.svg" alt="Visa" className="h-6" />
                          <img src="https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/mastercard.svg" alt="Mastercard" className="h-6" />
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                type="submit"
                className="mt-6 w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                {t('checkout.review_order')}
              </button>
            </form>
          )}

          {step === 'confirmation' && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6">{t('checkout.order_confirmation')}</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t('checkout.customer_info')}</h3>
                  <div className="text-gray-600">
                    <p>{customerInfo.firstName} {customerInfo.lastName}</p>
                    <p>{customerInfo.email}</p>
                    <p>{customerInfo.phone}</p>
                    <p>{customerInfo.address.street}</p>
                    <p>{customerInfo.address.city}, {customerInfo.address.postalCode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t('checkout.delivery_method')}</h3>
                  <div className="text-gray-600">
                    <p>{selectedDelivery.name}</p>
                    <p>{t('checkout.estimated_delivery')}: {selectedDelivery.estimatedDays} {t('days')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t('checkout.payment_method')}</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    {selectedPaymentMethodObj.icon}
                    <p>{selectedPaymentMethodObj.name}</p>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('checkout.processing') : t('checkout.place_order')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6">{t('checkout.order_summary')}</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/80x80?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">
                      {formatPrice(item.variant.price)} × {item.quantity}
                    </p>
                    {item.warranty && item.warranty.months && (
                      <p className="text-sm text-cyan-600">
                        {item.warranty.months} {t('checkout.months_warranty')}{item.warranty.additionalCost > 0 && `: ${formatPrice(item.warranty.additionalCost)}`}
                      </p>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-gray-700 mx-1">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t mt-6 pt-6">
              <div className="flex justify-between text-xl font-bold">
                <span>{t('checkout.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {t('checkout.including_costs')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}