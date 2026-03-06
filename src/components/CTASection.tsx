import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Button {
  text: string;
  to: string;
}

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryButton: Button;
  secondaryButton?: Button;
  variant?: 'blue' | 'dark' | 'cyan';
  className?: string;
}

export default function CTASection({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  variant = 'blue',
  className = ''
}: CTASectionProps) {
  const variantClasses = {
    blue: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800',
    cyan: 'bg-gradient-to-br from-cyan-500 to-blue-600'
  };

  return (
    <section className={`py-8 md:py-12 px-4 ${variantClasses[variant]} ${className}`}>
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-base md:text-lg mb-6 text-gray-100 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={primaryButton.to}
            className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {primaryButton.text}
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          {secondaryButton && (
            <Link
              to={secondaryButton.to}
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              {secondaryButton.text}
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
