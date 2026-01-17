import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { addCacheBuster } from '../lib/supabase-storage';
import { useTranslation } from '../hooks/useTranslation';
import { useLocale } from '../context/LocaleContext';
import { SEO } from '../components/SEO';
import LoadingState from '../components/LoadingState';

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
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { language } = useLocale();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug, language]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(false);

      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('locale', language)
        .eq('published', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        const { data: postInOtherLocale } = await supabase
          .from('blog_posts')
          .select('translation_group_id')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle();

        if (postInOtherLocale) {
          const { data: translatedPost } = await supabase
            .from('blog_posts')
            .select('slug')
            .eq('translation_group_id', postInOtherLocale.translation_group_id)
            .eq('locale', language)
            .eq('published', true)
            .maybeSingle();

          if (translatedPost) {
            navigate(`/blog/${translatedPost.slug}`, { replace: true });
            return;
          }
        }

        setError(true);
        return;
      }

      setPost(data);

      await incrementViews(data.id);
      await loadRelatedPosts(data.id, data.locale);
    } catch (error) {
      console.error('Error loading blog post:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function incrementViews(postId: string) {
    try {
      await supabase.rpc('increment_blog_views', { post_id: postId });
    } catch (error) {
      console.error('Error incrementing views:', error);
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
      console.error('Error loading related posts:', error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
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
        <Link to="/blog" className="text-blue-600 hover:text-blue-700">
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
        structuredData={structuredData}
      />

      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/blog"
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

        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('blog.relatedArticles')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
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