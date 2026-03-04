import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Eye, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { addCacheBuster } from '../lib/supabase-storage';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { useBlogTranslations } from '../context/BlogTranslationsContext';
import { SEO } from '../components/SEO';
import LoadingState from '../components/LoadingState';
import { SITE_URL } from '../lib/urls';

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

  // URL is the source of truth - normalize locale from URL
  const locale = urlLocale === 'ru' ? 'ru' : 'en';

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
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.image_url,
    datePublished: post.published_at,
    author: {
      '@type': 'Organization',
      name: 'LED Store'
    },
    publisher: {
      '@type': 'Organization',
      name: 'LED Store'
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

      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to={`/${locale}/blog/`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('blog.backToBlog')}
        </Link>

        {post.image_url && (
          <img
            src={addCacheBuster(post.image_url)}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-600">
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

        <div className="prose prose-lg max-w-none mb-12">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Recommended Product CTA */}
        <div className="my-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-8 shadow-lg">
          <Link
            to={`/${locale}/led-ceiling-lighting-kit`}
            className="block group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 text-white">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  {locale === 'ru' ? 'Готовые комплекты LED подсветки потолка' : 'Complete LED Ceiling Lighting Kits'}
                </h3>
                <p className="text-white/90">
                  {locale === 'ru'
                    ? 'Простая установка, профессиональный результат. COB LED без видимых точек.'
                    : 'Easy installation, professional results. COB LED without visible dots.'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold group-hover:bg-cyan-50 transition-colors">
                  {locale === 'ru' ? 'Посмотреть →' : 'View Kits →'}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('blog.relatedArticles')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
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