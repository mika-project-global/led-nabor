import { useState, useEffect } from 'react';
import { Save, X, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { addCacheBuster } from '../lib/supabase-storage';
import { ImageUpload } from './ImageUpload';
import ReactMarkdown from 'react-markdown';
import { useLocale } from '../context/LocaleContext';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  published: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  locale: string;
  translation_group_id?: string;
  author_id?: string;
}

interface BlogEditorProps {
  post?: BlogPost;
  onSave: () => void;
  onCancel: () => void;
}

export default function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const { locale: currentLocale } = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'ru'>((post?.locale as 'en' | 'ru') || currentLocale);
  const [translations, setTranslations] = useState<Record<string, BlogPost>>({});
  const [translationGroupId] = useState<string>(post?.translation_group_id || crypto.randomUUID());
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: null,
    published: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    locale: selectedLocale,
    translation_group_id: translationGroupId,
    ...post
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageInserted, setImageInserted] = useState(false);
  const [lastUploadedImageUrl, setLastUploadedImageUrl] = useState<string>('');
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  useEffect(() => {
    if (post?.translation_group_id) {
      loadTranslations(post.translation_group_id);
    }
  }, [post?.translation_group_id]);

  useEffect(() => {
    if (!post && formData.title) {
      const slug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post]);

  async function loadTranslations(groupId: string) {
    setLoadingTranslations(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('translation_group_id', groupId);

      if (error) throw error;

      const translationsMap: Record<string, BlogPost> = {};
      data?.forEach((translation) => {
        translationsMap[translation.locale] = translation;
      });
      setTranslations(translationsMap);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoadingTranslations(false);
    }
  }

  function handleLocaleSwitch(newLocale: 'en' | 'ru') {
    if (translations[newLocale]) {
      setFormData(translations[newLocale]);
      setSelectedLocale(newLocale);
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        image_url: formData.image_url,
        published: formData.published,
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        locale: newLocale,
        translation_group_id: translationGroupId
      });
      setSelectedLocale(newLocale);
    }
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(`Session error: ${sessionError.message}`);
        setSaving(false);
        return;
      }

      if (!session) {
        setError('You are not authenticated. Please log out and log in again.');
        setSaving(false);
        return;
      }

      console.log('Current user ID:', session.user.id);
      console.log('Saving for locale:', selectedLocale);
      console.log('Translation group ID:', translationGroupId);

      const existingPostForLocale = translations[selectedLocale];

      if (existingPostForLocale?.id) {
        const postData = {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          image_url: formData.image_url,
          published: formData.published,
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          seo_keywords: formData.seo_keywords,
          locale: selectedLocale,
          translation_group_id: translationGroupId,
          author_id: session.user.id,
          updated_at: new Date().toISOString()
        };

        console.log('Updating existing post:', existingPostForLocale.id, postData);

        const { error: updateError, count } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', existingPostForLocale.id)
          .select();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        if (count === 0) {
          throw new Error('Update blocked: You do not have permission to edit this post. Please check if you are the author.');
        }

        console.log('Update successful');
        await loadTranslations(translationGroupId);
      } else {
        const newId = crypto.randomUUID();
        const postData = {
          id: newId,
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          image_url: formData.image_url,
          published: formData.published,
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          seo_keywords: formData.seo_keywords,
          locale: selectedLocale,
          author_id: session.user.id,
          translation_group_id: translationGroupId,
          published_at: formData.published ? new Date().toISOString() : null
        };

        console.log('Creating new post:', postData);

        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        console.log('Insert successful');
        await loadTranslations(translationGroupId);
      }

      onSave();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setError(err.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  }

  function handleImageUploaded(url: string) {
    setFormData(prev => ({ ...prev, image_url: url }));
  }

  function handleContentImageUpload(url: string) {
    console.log('handleContentImageUpload called with URL:', url);
    const markdownImage = `![Image](${url})`;
    const newContent = formData.content
      ? formData.content + '\n\n' + markdownImage
      : markdownImage;

    console.log('Setting new content:', newContent);
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));

    setLastUploadedImageUrl(url);
    setImageInserted(true);
    setTimeout(() => setImageInserted(false), 3000);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Eye className="w-5 h-5" />
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {previewMode ? (
        <div className="prose prose-lg max-w-none mb-6">
          <h1>{formData.title}</h1>
          {formData.image_url && (
            <img src={addCacheBuster(formData.image_url)} alt={formData.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}
          <ReactMarkdown>{formData.content}</ReactMarkdown>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Language:</span>
              <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => handleLocaleSwitch('en')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedLocale === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  disabled={loadingTranslations}
                >
                  EN {translations.en && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => handleLocaleSwitch('ru')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedLocale === 'ru'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  disabled={loadingTranslations}
                >
                  RU {translations.ru && '✓'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              title="Only lowercase letters, numbers, and hyphens"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header Image
            </label>
            <ImageUpload
              currentImage={formData.image_url || undefined}
              onImageUploaded={handleImageUploaded}
              folder="blog-images"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (Markdown) *
            </label>
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-3">
                <ImageUpload
                  onImageUploaded={handleContentImageUpload}
                  folder="blog-content"
                  buttonText="Insert Image in Content"
                />
                {imageInserted && (
                  <span className="text-green-600 text-sm font-medium">
                    Image inserted!
                  </span>
                )}
              </div>
              {lastUploadedImageUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">Last uploaded:</span>
                  <input
                    type="text"
                    value={lastUploadedImageUrl}
                    readOnly
                    onClick={(e) => e.currentTarget.select()}
                    className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono cursor-pointer hover:bg-gray-50"
                    title="Click to select and copy"
                  />
                </div>
              )}
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={20}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Supports Markdown formatting (# headings, **bold**, *italic*, [links](url), ![image](url), etc.)
            </p>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to use post title"
                  maxLength={60}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seo_title.length}/60 characters (optimal: 50-60)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Leave empty to use excerpt"
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seo_description.length}/160 characters (optimal: 150-160)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="led strips, lighting, home decor"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Post'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
