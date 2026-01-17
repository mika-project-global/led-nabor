import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
  category: 'installation' | 'technical' | 'warranty' | 'delivery';
}

const faqItems: FAQItem[] = [
  {
    id: 'installation-1',
    questionKey: 'faq.questions.installation_1_q',
    answerKey: 'faq.questions.installation_1_a',
    category: 'installation'
  },
  {
    id: 'installation-2',
    questionKey: 'faq.questions.installation_2_q',
    answerKey: 'faq.questions.installation_2_a',
    category: 'installation'
  },
  {
    id: 'installation-3',
    questionKey: 'faq.questions.installation_3_q',
    answerKey: 'faq.questions.installation_3_a',
    category: 'installation'
  },
  {
    id: 'installation-4',
    questionKey: 'faq.questions.installation_4_q',
    answerKey: 'faq.questions.installation_4_a',
    category: 'installation'
  },
  {
    id: 'technical-1',
    questionKey: 'faq.questions.technical_1_q',
    answerKey: 'faq.questions.technical_1_a',
    category: 'technical'
  },
  {
    id: 'technical-2',
    questionKey: 'faq.questions.technical_2_q',
    answerKey: 'faq.questions.technical_2_a',
    category: 'technical'
  },
  {
    id: 'technical-3',
    questionKey: 'faq.questions.technical_3_q',
    answerKey: 'faq.questions.technical_3_a',
    category: 'technical'
  },
  {
    id: 'technical-4',
    questionKey: 'faq.questions.technical_4_q',
    answerKey: 'faq.questions.technical_4_a',
    category: 'technical'
  },
  {
    id: 'warranty-1',
    questionKey: 'faq.questions.warranty_1_q',
    answerKey: 'faq.questions.warranty_1_a',
    category: 'warranty'
  },
  {
    id: 'warranty-2',
    questionKey: 'faq.questions.warranty_2_q',
    answerKey: 'faq.questions.warranty_2_a',
    category: 'warranty'
  },
  {
    id: 'warranty-3',
    questionKey: 'faq.questions.warranty_3_q',
    answerKey: 'faq.questions.warranty_3_a',
    category: 'warranty'
  },
  {
    id: 'delivery-1',
    questionKey: 'faq.questions.delivery_1_q',
    answerKey: 'faq.questions.delivery_1_a',
    category: 'delivery'
  },
  {
    id: 'delivery-2',
    questionKey: 'faq.questions.delivery_2_q',
    answerKey: 'faq.questions.delivery_2_a',
    category: 'delivery'
  },
  {
    id: 'delivery-3',
    questionKey: 'faq.questions.delivery_3_q',
    answerKey: 'faq.questions.delivery_3_a',
    category: 'delivery'
  },
  {
    id: 'delivery-4',
    questionKey: 'faq.questions.delivery_4_q',
    answerKey: 'faq.questions.delivery_4_a',
    category: 'delivery'
  },
  {
    id: 'delivery-5',
    questionKey: 'faq.questions.delivery_5_q',
    answerKey: 'faq.questions.delivery_5_a',
    category: 'delivery'
  },
  {
    id: 'delivery-6',
    questionKey: 'faq.questions.delivery_6_q',
    answerKey: 'faq.questions.delivery_6_a',
    category: 'delivery'
  },
  {
    id: 'delivery-7',
    questionKey: 'faq.questions.delivery_7_q',
    answerKey: 'faq.questions.delivery_7_a',
    category: 'delivery'
  },
  {
    id: 'delivery-8',
    questionKey: 'faq.questions.delivery_8_q',
    answerKey: 'faq.questions.delivery_8_a',
    category: 'delivery'
  }
];

export default function FAQ() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredItems = faqItems.filter(item => {
    const question = t(item.questionKey).toLowerCase();
    const answer = t(item.answerKey).toLowerCase();
    const matchesSearch = question.includes(searchQuery.toLowerCase()) ||
                         answer.includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('faq.title')}</h1>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder={t('faq.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-cyan-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['installation', 'technical', 'warranty', 'delivery'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`faq.categories.${category}`)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setActiveId(activeId === item.id ? null : item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <span className="font-medium">{t(item.questionKey)}</span>
              {activeId === item.id ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            {activeId === item.id && (
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-gray-600">{t(item.answerKey)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
