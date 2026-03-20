import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { addCacheBuster } from '../lib/supabase-storage';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { useBlogTranslations } from '../context/BlogTranslationsContext';
import { SEO } from '../components/SEO';
import LoadingState from '../components/LoadingState';
import { SITE_URL, getProductUrl } from '../lib/urls';
import { products } from '../data/products';

const RGB_KEYWORDS = ['rgb', 'color', 'colour', 'smart', 'dynamic', 'music', 'scene', 'living-room', 'living_room', 'neon', 'multicolor', 'dimmer'];
const CCT_KEYWORDS = ['cct', 'white', 'kitchen', 'bathroom', 'bedroom', 'office', 'warm', 'cool', 'temperature', 'hallway', 'study', 'minimali'];

function detectRecommendedProduct(slug: string, title: string) {
  const text = `${slug} ${title}`.toLowerCase();
  const rgbScore = RGB_KEYWORDS.filter(k => text.includes(k)).length;
  const cctScore = CCT_KEYWORDS.filter(k => text.includes(k)).length;
  if (cctScore > rgbScore) return products.find(p => p.id === 2) ?? products[0];
  return products.find(p => p.id === 1) ?? products[0];
}

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  published_at: string;
  views: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  locale: string;
  translation_group_id: string;
}

export default function BlogPost() {
  const { slug, locale: urlLocale } = useParams<{ slug: string; locale: string }>();
  const { t, i18n } = useTranslation();
  const { setTranslations, clearTranslations } = useBlogTranslations();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [alternateUrls, setAlternateUrls] = useState<Record<string, string>>({});

  // URL is the source of truth - use locale from URL directly
  const locale = urlLocale || 'en';

  useEffect(() => {
    if (slug && locale) {
      loadPost();
    }

    // Clear translations when unmounting or changing post
    return () => {
      clearTranslations();
    };
  }, [slug, locale]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(false);

      // HOTFIX: Load post ONLY by slug + locale from URL
      // No automatic redirects to other locales or slugs
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .eq('published', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // Post not found in current locale - show 404
        // Do NOT redirect to other locales automatically
        setError(true);
        setLoading(false);
        return;
      }

      setPost(data);

      // Load related data (without redirects)
      await incrementViews(data.id);
      await loadRelatedPosts(data.id, data.locale);
      await loadAlternateUrls(data.translation_group_id);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function incrementViews(postId: string) {
    try {
      await supabase.rpc('increment_blog_views', { post_id: postId });
    } catch (error) {
    }
  }

  async function loadRelatedPosts(currentPostId: string, postLocale: string) {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, image_url, published_at, views, locale')
        .eq('published', true)
        .eq('locale', postLocale)
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        setRelatedPosts(data);
      }
    } catch (error) {
    }
  }

  async function loadAlternateUrls(translationGroupId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('slug, locale')
        .eq('translation_group_id', translationGroupId)
        .eq('published', true);

      if (fetchError) {
        return;
      }

      if (data) {
        const alternates: Record<string, string> = {};
        const translationUrls: Record<string, string> = {};

        data.forEach(translation => {
          const fullUrl = `${SITE_URL}/${translation.locale}/blog/${translation.slug}/`;
          const relativeUrl = `/${translation.locale}/blog/${translation.slug}/`;

          alternates[translation.locale] = fullUrl;
          translationUrls[translation.locale] = relativeUrl;
        });

        setAlternateUrls(alternates);
        setTranslations(translationUrls);
      }
    } catch (error) {
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = {
      'en': 'en-GB',
      'ru': 'ru-RU',
      'uk': 'uk-UA',
      'cz': 'cs-CZ',
      'de': 'de-DE',
      'pl': 'pl-PL'
    };
    return new Intl.DateTimeFormat(localeMap[locale] || 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  function estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('blog.postNotFound')}
        </h1>
        <Link to={`/${locale}/blog/`} className="text-blue-600 hover:text-blue-700">
          {t('blog.backToBlog')}
        </Link>
      </div>
    );
  }

  const readingTime = estimateReadingTime(post.content);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://led-nabor.com';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.image_url || undefined,
    url: `${siteUrl}/${locale}/blog/${post.slug}/`,
    datePublished: post.published_at,
    dateModified: post.published_at,
    keywords: post.seo_keywords || undefined,
    author: {
      '@type': 'Organization',
      name: 'LED Nabor',
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'LED Nabor',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon/web-app-manifest-512x512.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${locale}/blog/${post.slug}/`
    }
  };

  return (
    <>
      <SEO
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        image={post.image_url || undefined}
        type="article"
        keywords={post.seo_keywords || undefined}
        schema={structuredData}
        alternateUrls={alternateUrls}
      />

      <article className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        <Link
          to={`/${locale}/blog/`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('blog.backToBlog')}
        </Link>

        {post.image_url && (
          <img
            src={addCacheBuster(post.image_url)}
            alt={post.title}
            className="w-full h-72 md:h-80 object-cover rounded-lg mb-6"
          />
        )}

        <header className="mb-6">
          <h1 className="heading-h1 mb-3">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 md:gap-5 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{readingTime} {t('blog.minRead')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{post.views} {t('blog.views')}</span>
            </div>
          </div>
        </header>

        <div className="prose prose-sm md:prose-base max-w-none mb-8 md:mb-10 prose-headings:font-semibold prose-h2:text-2xl prose-h2:md:text-3xl prose-h3:text-xl prose-h3:md:text-2xl prose-p:leading-relaxed prose-li:leading-relaxed">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Recommended Product CTA */}
        {(() => {
          const rec = detectRecommendedProduct(post.slug, post.title);
          const isRgb = rec.id === 1;
          return (
            <div className="my-8 md:my-10 rounded-xl overflow-hidden shadow-md border border-gray-100 bg-white">
              <div className={`h-1.5 ${isRgb ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gradient-to-r from-gray-400 to-gray-600'}`} />
              <div className="flex flex-col sm:flex-row items-stretch gap-0">
                <div className="sm:w-32 md:w-40 shrink-0 overflow-hidden bg-gray-100">
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-full h-36 sm:h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded mb-2 ${isRgb ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isRgb ? 'RGB + CCT' : 'CCT'}
                    </span>
                    <h3 className="font-bold text-gray-900 mb-1">{rec.name}</h3>
                    <p className="text-sm text-gray-500">{t('blog.ctaKitsDescription')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link
                      to={getProductUrl(locale, rec)}
                      className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                        isRgb ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {t('blog.ctaKitsButton')}
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      to={`/${locale}/comparison`}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      {t('comparison.title', 'Compare kits')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {relatedPosts.length > 0 && (
          <section className="mt-12 md:mt-14 pt-6 md:pt-8 border-t border-gray-200">
            <h2 className="heading-h2 mb-5">
              {t('blog.relatedArticles')}
            </h2>
            <div className="grid md:grid-cols-3 gap-4 md:gap-5">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/${locale}/blog/${relatedPost.slug}/`}
                  className="group"
                >
                  {relatedPost.image_url && (
                    <img
                      src={addCacheBuster(relatedPost.image_url)}
                      alt={relatedPost.title}
                      className="w-full h-32 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}