import React from 'react';
import { Star, Award, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SocialProof() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Users,
      value: '5000+',
      label: t('social_proof.happy_customers')
    },
    {
      icon: Star,
      value: '4.9',
      label: t('social_proof.average_rating')
    },
    {
      icon: Award,
      value: `12 ${t('social_proof.years')}`,
      label: t('social_proof.in_business')
    },
    {
      icon: Shield,
      value: t('social_proof.premium'),
      label: t('social_proof.quality')
    }
  ];

  const testimonials = [
    {
      text: t('social_proof.testimonial_1'),
      author: "Thomas Weber",
      location: "Berlin",
      rating: 5
    },
    {
      text: t('social_proof.testimonial_2'),
      author: "Marie Dubois",
      location: "Paris",
      rating: 5
    },
    {
      text: t('social_proof.testimonial_3'),
      author: "Jan Novák",
      location: "Prague",
      rating: 5
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-cyan-50 rounded-full flex items-center justify-center">
              <stat.icon size={24} className="text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="text-center mb-12">
        <p className="text-lg text-gray-600">
          {t('social_proof.over')} <span className="font-bold text-cyan-600">5000</span> {t('social_proof.satisfied_customers_text')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex text-yellow-400 mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{testimonial.author}</div>
              <div className="text-gray-500">{testimonial.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}