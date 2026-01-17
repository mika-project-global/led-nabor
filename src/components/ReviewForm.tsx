import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { ReviewFormData } from '../types';
import { useTranslation } from 'react-i18next';

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        rating,
        comment,
        author_name: authorName
      });
      
      // Reset form
      setRating(5);
      setComment('');
      setAuthorName('');
    } catch (error) {
      setError(t('review_form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('review_form.your_rating')}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="text-yellow-400 hover:scale-110 transition-transform"
            >
              <Star
                size={24}
                fill={value <= rating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('review_form.your_name')}
        </label>
        <input
          type="text"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
          placeholder={t('review_form.name_placeholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('review_form.your_review')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
          placeholder={t('review_form.review_placeholder')}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-300"
      >
        {isSubmitting ? t('review_form.submitting') : t('review_form.submit')}
      </button>
    </form>
  );
}