import React, { useState } from 'react';
import {
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Review } from '../types';

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;
  const { t } = useTranslation();

  // Сортируем отзывы по дате (новые сверху)
  const sortedReviews = [...reviews].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Определяем, какие отзывы показывать
  const displayedReviews = isExpanded
    ? sortedReviews.slice(
        (currentPage - 1) * reviewsPerPage,
        currentPage * reviewsPerPage
      )
    : sortedReviews.slice(0, 2);

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        {t('reviews.no_reviews')}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="reviews-section">
      {/* Отзывы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayedReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < review.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="font-medium">{review.author_name}</span>
              <span className="text-gray-500 text-sm">
                {formatDate(review.created_at)}
              </span>
            </div>
            {review.comment && (
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {/* Показываем кнопку только если есть дополнительные отзывы */}
      {sortedReviews.length > 2 && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              setCurrentPage(1);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={20} />
                <span>{t('reviews.collapse')}</span>
              </>
            ) : (
              <>
                <ChevronDown size={20} />
                <span>
                  {t('reviews.show_all')} ({reviews.length})
                </span>
              </>
            )}
          </button>

          {/* Пагинация только в развернутом состоянии */}
          {isExpanded && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentPage === pageNumber
                          ? 'bg-cyan-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber}>...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
