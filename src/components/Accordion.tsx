import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string | React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number | null;
  className?: string;
}

export default function Accordion({ items, defaultOpen = null, className = '' }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 md:px-5 py-3 md:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
          >
            <span className="text-base md:text-lg font-semibold text-gray-900 pr-8">
              {item.question}
            </span>
            {openIndex === index ? (
              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-4 md:px-5 pb-3 md:pb-4 pt-1 md:pt-2">
              <div className="text-sm md:text-base text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
