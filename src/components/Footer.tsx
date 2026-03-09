import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Products Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('menu.products')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${locale}/led-ceiling-lighting-kit`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.ceiling_lighting_kit')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/catalog`}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.all_products')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/business`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.for_business')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.information')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${locale}/about`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.about_us')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/warranty`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.warranty')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/faq`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.faq')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/installation-guide`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.installation_guide')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${locale}/support`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.support')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/blog`}
                  className="hover:text-white transition-colors"
                >
                  {t('menu.blog')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/privacy-policy`}
                  className="hover:text-white transition-colors"
                >
                  {t('privacy_policy')}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${locale}/terms`}
                  className="hover:text-white transition-colors"
                >
                  {t('terms_of_use')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@led-nabor.com"
                  className="hover:text-white transition-colors"
                >
                  info@led-nabor.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+420722414539"
                  className="hover:text-white transition-colors"
                >
                  +420 722 414 539
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  {t('footer.prague_czech_republic')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {currentYear} LED Nabor. {t('footer.all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
