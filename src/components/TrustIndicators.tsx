import React from 'react';
import { Shield, Truck, CreditCard, HeadphonesIcon, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TrustIndicators() {
  const { t } = useTranslation();

  const indicators = [
    {
      icon: Shield,
      title: t('trust_indicators.warranty_years'),
      description: t('trust_indicators.warranty')
    },
    {
      icon: Truck,
      title: t('trust_indicators.free_delivery'),
      description: t('trust_indicators.delivery_time')
    },
    {
      icon: CreditCard,
      title: t('trust_indicators.secure_payment'),
      description: t('trust_indicators.payment_methods')
    },
    {
      icon: Clock,
      title: t('trust_indicators.long_service_life'),
      description: t('trust_indicators.service_life_desc')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
              <indicator.icon className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="font-bold mb-2">{indicator.title}</h3>
            <p className="text-gray-600 text-sm">{indicator.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}