import React, { useState, useEffect } from 'react';
import { ImageUpload } from '../components/ImageUpload';
import { VideoUpload } from '../components/VideoUpload';
import { LogoUploader } from '../components/LogoUploader';
import { UsageMonitoring } from '../components/UsageMonitoring';
import { PriceManager } from '../components/PriceManager';
import { InstallationVideosManager } from '../components/InstallationVideosManager';
import BlogEditor from '../components/BlogEditor';
import { AIImageEditor } from '../components/AIImageEditor';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from '../lib/auth-utils';
import { products } from '../data/products';
import { Trash2, CheckCircle, Plus, Edit2, Eye, Sparkles } from 'lucide-react';

interface ProductVideo {
  id: string;
  product_id: number;
  video_url: string;
  title: string | null;
  order_position: number;
  is_primary: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  published: boolean;
  published_at: string | null;
  views: number;
  locale: string;
  created_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  translation_group_id: string;
  author_id: string;
}

export default function Admin() {
  const { t } = useTranslation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<ProductVideo[]>([]);
  const [siteLogo, setSiteLogo] = useState<string | undefined>();
  const [uploadType, setUploadType] = useState<'blog' | 'product'>('blog');
  const [activeTab, setActiveTab] = useState<'media' | 'prices' | 'installation' | 'blog'>('media');
  const [selectedProductForVideo, setSelectedProductForVideo] = useState<number>(products[0]?.id || 20);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    loadProductVideos();
  }, [selectedProductForVideo]);

  useEffect(() => {
    if (activeTab === 'blog') {
      loadBlogPosts();
    }
  }, [activeTab]);

  async function checkAdminAccess() {
    setIsCheckingAccess(true);
    try {
      const isAdminUser = await checkIsAdmin();
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setIsCheckingAccess(false);
    }
  }

  const loadProductVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('product_videos')
        .select('*')
        .eq('product_id', selectedProductForVideo)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setUploadedVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setUploadedImages(prev => [...prev, url]);
  };

  const handleVideoUploaded = async (url: string) => {
    try {
      const { error } = await supabase
        .from('product_videos')
        .insert({
          product_id: selectedProductForVideo,
          video_url: url,
          title: videoTitle || null,
          order_position: uploadedVideos.length,
          is_primary: uploadedVideos.length === 0
        });

      if (error) throw error;

      setUploadMessage({ type: 'success', text: 'Видео успешно загружено и привязано к продукту!' });
      setVideoTitle('');
      await loadProductVideos();

      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      console.error('Error saving video:', error);
      setUploadMessage({ type: 'error', text: 'Ошибка при сохранении видео в базу данных' });
      setTimeout(() => setUploadMessage(null), 5000);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Удалить это видео?')) return;

    try {
      const { error } = await supabase
        .from('product_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      setUploadMessage({ type: 'success', text: 'Видео удалено' });
      await loadProductVideos();
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting video:', error);
      setUploadMessage({ type: 'error', text: 'Ошибка при удалении видео' });
      setTimeout(() => setUploadMessage(null), 5000);
    }
  };

  const handleLogoUploaded = (url: string) => {
    setSiteLogo(url);
  };

  const loadBlogPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, excerpt, image_url, published, published_at, views, locale, created_at, seo_title, seo_description, seo_keywords, translation_group_id, author_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupedPosts = new Map();
      data?.forEach(post => {
        if (!groupedPosts.has(post.translation_group_id)) {
          groupedPosts.set(post.translation_group_id, {
            ...post,
            availableLocales: [post.locale]
          });
        } else {
          const existing = groupedPosts.get(post.translation_group_id);
          existing.availableLocales.push(post.locale);
        }
      });

      const uniquePosts = Array.from(groupedPosts.values());
      setBlogPosts(uniquePosts as any);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this blog post and all its translations? This action cannot be undone.')) return;

    try {
      const post = blogPosts.find(p => p.id === postId);
      if (!post) return;

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('translation_group_id', post.translation_group_id);

      if (error) throw error;

      setUploadMessage({ type: 'success', text: 'Blog post deleted successfully' });
      await loadBlogPosts();
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      setUploadMessage({ type: 'error', text: 'Failed to delete blog post' });
      setTimeout(() => setUploadMessage(null), 5000);
    }
  };

  const handlePostSaved = async () => {
    setEditingPost(null);
    setIsCreatingPost(false);
    setUploadMessage({ type: 'success', text: 'Blog post saved successfully' });
    await loadBlogPosts();
    setTimeout(() => setUploadMessage(null), 3000);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setIsCreatingPost(false);
  };

  if (isCheckingAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-700 mb-4">
            You do not have permission to access the admin panel.
          </p>
          <p className="text-sm text-red-600">
            Only administrators can access this area. If you believe this is an error, please contact the site administrator.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.title')}</h1>
      
      <div className="mb-8">
        <UsageMonitoring />
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          onClick={() => setActiveTab('media')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'media'
              ? 'border-b-2 border-cyan-500 text-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.tabs.media')}
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'prices'
              ? 'border-b-2 border-cyan-500 text-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.tabs.prices')}
        </button>
        <button
          onClick={() => setActiveTab('installation')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'installation'
              ? 'border-b-2 border-cyan-500 text-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Видео установки
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'blog'
              ? 'border-b-2 border-cyan-500 text-cyan-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Blog / SEO Articles
        </button>
      </div>
      
      {activeTab === 'media' && (
        <div className="grid grid-cols-1 gap-8">
          {/* Logo Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.logo.title')}</h2>
            <div className="flex items-center gap-8">
              <LogoUploader
                onLogoUploaded={handleLogoUploaded}
                currentLogo={siteLogo}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {t('admin.logo.requirements')}
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{t('admin.images.title')}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadType('blog')}
                  className={`px-4 py-2 rounded-lg ${
                    uploadType === 'blog'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t('admin.tabs.blog')}
                </button>
                <button
                  onClick={() => setUploadType('product')}
                  className={`px-4 py-2 rounded-lg ${
                    uploadType === 'product'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Для продуктов
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Upload component */}
              <div>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  folder={uploadType === 'blog' ? 'blog/led' : 'products'}
                />
              </div>

              {/* Uploaded images */}
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative space-y-2">
                  <div className="relative">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 right-2">
                      <input
                        type="text"
                        value={url}
                        readOnly
                        className="w-full px-2 py-1 text-xs bg-white/90 rounded border"
                        onClick={e => e.currentTarget.select()}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingImageIndex(index)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                  >
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">AI Редактор</span>
                  </button>

                  {editingImageIndex === index && (
                    <AIImageEditor
                      imageUrl={url}
                      onImageProcessed={(newUrl) => {
                        const newImages = [...uploadedImages];
                        newImages[index] = newUrl;
                        setUploadedImages(newImages);
                        setEditingImageIndex(null);
                      }}
                      onClose={() => setEditingImageIndex(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.videos.title')}</h2>

            {uploadMessage && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {uploadMessage.type === 'success' && <CheckCircle size={20} />}
                {uploadMessage.text}
              </div>
            )}

            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Выберите продукт:</label>
                <select
                  value={selectedProductForVideo}
                  onChange={(e) => setSelectedProductForVideo(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Название видео (опционально):</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Например: Установка LED ленты"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Upload component */}
              <div>
                <VideoUpload
                  onVideoUploaded={handleVideoUploaded}
                  folder="products"
                />
              </div>

              {/* Loading state */}
              {isLoadingVideos && (
                <div className="col-span-2 flex items-center justify-center h-48 text-gray-500">
                  Загрузка видео...
                </div>
              )}

              {/* Uploaded videos for selected product */}
              {!isLoadingVideos && uploadedVideos.map((video) => (
                <div key={video.id} className="relative group">
                  <video
                    src={video.video_url}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                  {video.title && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.title}
                    </div>
                  )}
                  {video.is_primary && (
                    <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                      Основное
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить видео"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 right-12">
                    <input
                      type="text"
                      value={video.video_url}
                      readOnly
                      className="w-full px-2 py-1 text-xs bg-white/90 rounded border"
                      onClick={e => e.currentTarget.select()}
                    />
                  </div>
                </div>
              ))}

              {!isLoadingVideos && uploadedVideos.length === 0 && (
                <div className="col-span-2 flex items-center justify-center h-48 text-gray-400">
                  Для этого продукта еще нет видео
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'prices' && (
        <PriceManager />
      )}

      {activeTab === 'installation' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <InstallationVideosManager />
        </div>
      )}

      {activeTab === 'blog' && (
        <div>
          {uploadMessage && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {uploadMessage.type === 'success' && <CheckCircle size={20} />}
              {uploadMessage.text}
            </div>
          )}

          {(isCreatingPost || editingPost) ? (
            <BlogEditor
              post={editingPost || undefined}
              onSave={handlePostSaved}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
                <button
                  onClick={() => setIsCreatingPost(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create New Post
                </button>
              </div>

              {isLoadingPosts ? (
                <div className="text-center py-12 text-gray-500">Loading posts...</div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No blog posts yet. Create your first post to start building your SEO content.
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded ${
                                post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {post.published ? 'Published' : 'Draft'}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600 font-medium">Languages:</span>
                                {(post as any).availableLocales?.map((locale: string) => (
                                  <span key={locale} className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                    {locale.toUpperCase()}
                                  </span>
                                ))}
                              </div>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views}
                              </span>
                              <span>
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              title="View post"
                            >
                              <Eye className="w-5 h-5" />
                            </a>
                            <button
                              onClick={() => setEditingPost(post as any)}
                              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                              title="Edit post"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}