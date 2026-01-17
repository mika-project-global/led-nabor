import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronRight, ChevronLeft, Quote, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { Review } from '../types';

export function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const reviewsPerView = 3;
  const { t } = useTranslation();
  const { language } = useLocale();

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + reviewsPerView >= reviews.length ? 0 : prevIndex + reviewsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - reviewsPerView < 0 ? Math.max(0, reviews.length - reviewsPerView) : prevIndex - reviewsPerView
    );
  };

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [reviews.length]);

  // Force re-render when language changes to update date formatting
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [language]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <MessageSquare size={24} className="text-cyan-500" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-gray-900">{t('customerReviews')}</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('customerReviewDescription')}</p>
        </div>

        <div className="relative">
          {/* Carousel Navigation */}
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label={t('reviews.previous')}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label={t('reviews.next')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Carousel Container */}
          <div 
            ref={carouselRef}
            className="overflow-hidden"
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / reviewsPerView)}%)` }}
            >
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="w-full md:w-1/3 flex-shrink-0 px-3"
                >
                  <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] relative overflow-hidden h-full border border-gray-100">
                    <div className="absolute -top-4 -left-4 text-cyan-100 opacity-20">
                      <Quote size={80} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 relative z-10" aria-label={`${review.rating} ${t('reviews.stars')}`}>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-gray-800">{review.author_name}</span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed line-clamp-4 relative z-10 italic">
                        {review.comment}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t text-sm text-gray-500 flex justify-end">
                      {new Date(review.created_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : 
                        language === 'cs' ? 'cs-CZ' : 
                        language === 'de' ? 'de-DE' : 
                        language === 'uk' ? 'uk-UA' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: Math.ceil(reviews.length / reviewsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * reviewsPerView)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / reviewsPerView) === index 
                    ? 'bg-cyan-500 w-8' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`${t('reviews.go_to_slide')} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}