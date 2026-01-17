import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getWarrantyPolicies } from '../lib/warranty';
import { WarrantyPolicy, WarrantySelection } from '../types';
import { ShoppingCart as CartIcon, Truck, Shield, Package, Star, Info, Play, CheckCircle, Radio, Sparkles, Wrench, FileText, PenTool as Tool, Send, Upload, Table as Tabs, Settings, Calculator, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../lib/supabase-storage';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { WarrantySelector } from '../components/WarrantySelector';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewsList } from '../components/ReviewsList';
import { LightingCalculator } from '../components/LightingCalculator';
import { InstallationTimeline } from '../components/InstallationTimeline';
import { SocialProof } from '../components/SocialProof';
import { ProductRecommendations } from '../components/ProductRecommendations';
import { TrustIndicators } from '../components/TrustIndicators';
import { ComparisonTable } from '../components/ComparisonTable';
import { ProjectGallery } from '../components/ProjectGallery';
import { products } from '../data/products';
import { Review, ReviewFormData } from '../types';
import { supabase } from '../lib/supabase';
import { AddToCartAnimation } from '../components/AddToCartAnimation';
import { refreshProductData } from '../lib/price-management';
import { useViewingHistory } from '../hooks/useViewingHistory';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AIImageEditor } from '../components/AIImageEditor';
import { checkIsAdmin } from '../lib/auth-utils';

type TabType = 'overview' | 'details' | 'calculator' | 'gallery' | 'reviews';
import { SEO } from '../components/SEO';

function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(productId));
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [warrantyPolicies, setWarrantyPolicies] = useState<WarrantyPolicy[]>([]);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantySelection | null>(null);
  const [showLengthOptions, setShowLengthOptions] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { formatPrice } = useLocale();
  const { t } = useTranslation();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openSubsections, setOpenSubsections] = useState<Record<string, boolean>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoadingVariant, setIsLoadingVariant] = useState(false);
  const [priceTransition, setPriceTransition] = useState<'fade-in' | 'fade-out' | ''>('');
  const { addToHistory } = useViewingHistory();
  const [productVideos, setProductVideos] = useState<Array<{id: string, video_url: string, title: string | null}>>([]);
  const [showAIEditor, setShowAIEditor] = useState(false);
  const [currentImageForAI, setCurrentImageForAI] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  const tabs = [
    { id: 'overview', label: t('product.overview'), icon: Info },
    { id: 'details', label: t('product.specifications'), icon: Settings },
    { id: 'calculator', label: t('product.calculators'), icon: Calculator },
    { id: 'gallery', label: t('product.gallery'), icon: ImageIcon },
    { id: 'reviews', label: t('product.reviews'), icon: Star }
  ];

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const toggleSubsection = (title: string) => {
    setOpenSubsections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Load reviews
  useEffect(() => {
    if (product) {
      const fetchReviews = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading reviews:', error);
            return;
          }

          setReviews(data || []);
        } catch (error) {
          console.error('Error in fetchReviews:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchReviews();
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      addToHistory(product.id);

      const loadProductVideos = async () => {
        try {
          const { data, error } = await supabase
            .from('product_videos')
            .select('id, video_url, title')
            .eq('product_id', product.id)
            .order('order_position', { ascending: true });

          if (error) {
            console.error('Error loading product videos:', error);
            return;
          }

          setProductVideos(data || []);
        } catch (error) {
          console.error('Error in loadProductVideos:', error);
        }
      };

      const checkAdminStatus = async () => {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      };

      loadProductVideos();
      checkAdminStatus();
    }
  }, [product, addToHistory]);

  // Set initial variant
  useEffect(() => {
    if (product && !selectedVariant) {
      // Find the 5-meter variant as default, or fall back to the first variant
      // Find the 5-meter variant or use the first one
      const initialVariant = product.variants.find(v => v.id.endsWith('-5')) || product.variants[0];
      setSelectedVariant(initialVariant);
      setTotalPrice(initialVariant.price);
    }
  }, [product, selectedVariant]);
  
  // Handle variant change with automatic price refresh
  const handleVariantChange = async (variant: any) => {
    setIsLoadingVariant(true);
    if (priceTransition !== 'fade-out') {
      setPriceTransition('fade-out');
    }
    setSelectedVariant(variant);
    setShowLengthOptions(false);
    
    try {
      // Refresh product data to get the latest price
      const refreshedProduct = await refreshProductData(product.id);
      if (refreshedProduct?.variants) {
        // Find the refreshed variant with the latest price
        const refreshedVariant = refreshedProduct.variants.find((v: any) => v.id === variant.id);
        
        if (refreshedVariant) {
          // Update with the latest price from the database
          setTimeout(() => {
            setPriceTransition('fade-in');
            setTotalPrice(refreshedVariant.price || variant.price);
            // Also update the selected variant with the latest data
            setSelectedVariant(refreshedVariant);
            setIsLoadingVariant(false);
          }, 150);
        } else {
          // Fallback to the selected variant's price if refresh failed
          setTimeout(() => {
            setPriceTransition('fade-in');
            setTotalPrice(variant.price);
            setIsLoadingVariant(false);
          }, 150);
        }
      } else {
        // Fallback to the selected variant's price if refresh failed
        setTimeout(() => {
          setPriceTransition('fade-in');
          setTotalPrice(variant.price);
          setIsLoadingVariant(false);
        }, 150);
      }
    } catch (error) {
      console.error('Error refreshing variant price:', error);
      // Fallback to the selected variant's price if refresh failed
      setTimeout(() => {
        setPriceTransition('fade-in');
        setTotalPrice(variant.price);
        setIsLoadingVariant(false);
      }, 150);
    }
  };
  
  // Calculate total price when variant or warranty changes
  useEffect(() => {
    if (selectedVariant) {
      // Make sure we're using the latest price from the variant
      const currentVariant = product.variants.find(v => v.id === selectedVariant.id);
      setTotalPrice(currentVariant?.price || selectedVariant.price);
    } else {
      setTotalPrice(null);
    }
  }, [selectedVariant, selectedWarranty]);
  
  // Load warranty policies
  useEffect(() => {
    if (product) {
      getWarrantyPolicies(product.id)
        .then(policies => {          
          // Filter out any non-default policies
          const filteredPolicies = policies.filter(p => p.is_default);
          setWarrantyPolicies(filteredPolicies);
          // Set default policy
          const defaultPolicy = filteredPolicies.find(p => p.is_default);
          if (defaultPolicy) {
            setSelectedWarranty({
              policyId: defaultPolicy.id,
              months: defaultPolicy.months,
              additionalCost: 0
            });
          }
        })
        .catch(error => console.error('Error loading warranty policies:', error));
    }
  }, [product]);

  const handleReviewSubmit = async (formData: ReviewFormData) => {
    if (!product) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: product.id,
          rating: formData.rating,
          comment: formData.comment,
          author_name: formData.author_name
        });

      if (error) throw error;

      // Update reviews list
      const { data: newReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      setReviews(newReviews || []);
      setIsReviewFormVisible(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const handleOpenAIEditor = () => {
    const currentMedia = product.images && product.images.length > 0
      ? product.images[selectedImage]
      : product.image;

    const isYouTube = currentMedia.includes('youtube.com') || currentMedia.includes('youtu.be');

    if (isYouTube) {
      alert('AI обработка доступна только для изображений, не для видео');
      return;
    }

    setCurrentImageForAI(getImageUrl(currentMedia));
    setShowAIEditor(true);
  };

  const handleImageProcessed = async (processedUrl: string) => {
    console.log('Обработанное изображение:', processedUrl);
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('product.not_found')}</h1>
      </div>
    );
  }

  // Parse product description
  const parseDescription = (description: string) => {
    const lines = description.split('\n');
    const sections: Array<{
      title: string;
      content: string;
      subsections: Array<{ title: string; content: string }>;
    }> = [];
    
    let currentSection: typeof sections[0] | null = null;
    let currentSubsection: { title: string; content: string } | null = null;
    let introContent = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## ')) {
        // If there's a current section, add it
        if (currentSection) {
          if (currentSubsection) {
            currentSection.subsections.push({
              title: currentSubsection.title,
              content: currentSubsection.content.trim()
            });
            currentSubsection = null;
          }
          sections.push(currentSection);
        }
        
        // Create new section
        currentSection = {
          title: trimmedLine.replace(/^##\s*/, ''),
          content: '',
          subsections: []
        };
      } else if (trimmedLine.startsWith('### ') && currentSection) {
        // If there's a current subsection, save it
        if (currentSubsection) {
          currentSection.subsections.push({
            title: currentSubsection.title,
            content: currentSubsection.content.trim()
          });
        }
        
        // Create new subsection
        currentSubsection = {
          title: trimmedLine.replace(/^###\s*/, ''),
          content: ''
        };
      } else if (currentSubsection) {
        // Add content to current subsection
        currentSubsection.content += line + '\n';
      } else if (currentSection) {
        // Add content to current section
        currentSection.content += line + '\n';
      } else {
        // Add content to introduction
        introContent += line + '\n';
      }
    });
    
    // Add the last section and subsection, if they exist
    if (currentSection) {
      if (currentSubsection) {
        currentSection.subsections.push({
          title: currentSubsection.title,
          content: currentSubsection.content.trim()
        });
      }
      sections.push(currentSection);
    }
    
    // Add introduction as first section
    if (introContent.trim()) {
      sections.unshift({
        title: '',
        content: introContent.trim(),
        subsections: []
      });
    }

    return sections;
  };

  const translateSection = (section: any) => {
    if (section.title === 'Key Benefits') {
      const translatedTitle = t('comparison.key_benefits');
      let translatedContent = section.content;

      translatedContent = translatedContent
        .replace(/RGB \+ adjustable white \(2700K-6500K\)/g, t('comparison.rgb_adjustable_white'))
        .replace(/COB strip \(uniform light, no dots\)/g, t('comparison.cob_strip_uniform'))
        .replace(/Wi-Fi control via app/g, t('comparison.wifi_control_via_app'))
        .replace(/Voice command support/g, t('comparison.voice_command_support'))
        .replace(/10-year lifespan/g, t('comparison.ten_year_lifespan'))
        .replace(/Adjustable white light \(2700K-6500K\)/g, t('products.2.features.0'))
        .replace(/COB strip \(no dots, uniform light\)/g, t('products.2.features.1'))
        .replace(/Compact power supplies/g, 'Compact power supplies')
        .replace(/Wi-Fi control/g, t('comparison.wifi_control'));

      return { ...section, title: translatedTitle, content: translatedContent };
    }
    return section;
  };

  const sections = parseDescription(product.description);
  const [intro, ...contentSections] = sections.map(translateSection);

  // Initialize section state
  useEffect(() => {
    if (product) {
      const newSections = {};
      const newSubsections = {};

      contentSections.forEach(section => {
        newSections[section.title] = false;
        section.subsections.forEach(subsection => {
          newSubsections[subsection.title] = false;
        });
      });

      setOpenSections(newSections);
      setOpenSubsections(newSubsections);
      setSelectedImage(0);
    }
  }, [product, t]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const productImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: getImageUrl(productImage),
    offers: {
      '@type': 'Offer',
      price: selectedVariant?.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviews.length
    } : undefined
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={t(`products.${product.id}.name`)}
        description={t(`products.${product.id}.description`).slice(0, 160)}
        image={getImageUrl(productImage)}
        type="product"
        schema={productSchema}
      />
      <Breadcrumbs
        items={[
          { label: t(`products.${product.id}.name`) }
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Images and Video */}
        <div className="space-y-8">
          <div className="product-card">
            <div className="relative aspect-[4/3] mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {(() => {
                const currentMedia = product.images && product.images.length > 0
                  ? product.images[selectedImage]
                  : product.image;
                const isYouTube = currentMedia.includes('youtube.com') || currentMedia.includes('youtu.be');

                if (isYouTube) {
                  return (
                    <iframe
                      src={currentMedia}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={t(`products.${product.id}.name`)}
                    />
                  );
                }

                return (
                  <ImageWithFallback
                    src={getImageUrl(currentMedia)}
                    alt={t(`products.${product.id}.name`)}
                    className="w-full h-full object-contain transition-opacity duration-300"
                    width={800}
                    height={600}
                    loading="eager"
                  />
                );
              })()}
            </div>

            {/* AI Processing Button - Only for Admins */}
            {isAdmin && (
              <button
                onClick={handleOpenAIEditor}
                className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Sparkles size={20} />
                <span className="font-semibold">AI Обработка Изображения</span>
              </button>
            )}

            {product.images && product.images.length > 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => {
                    const isYouTube = image.includes('youtube.com') || image.includes('youtu.be');

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-cyan-400 ${
                          selectedImage === index ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-gray-200'
                        }`}
                        aria-label={`Show ${isYouTube ? 'video' : 'image'} ${index + 1}`}
                      >
                        {isYouTube ? (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-80" />
                          </div>
                        ) : (
                          <ImageWithFallback
                            src={getImageUrl(image)}
                            alt=""
                            className="w-full h-full object-cover"
                            width={200}
                            height={150}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
                        <Package size={26} className="text-cyan-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{t('product.in_stock')}</span>
                      <span className="text-xs text-gray-600 mt-1">{t('product.ready_to_ship')}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
                        <Truck size={26} className="text-cyan-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{t('product.free_delivery')}</span>
                      <span className="text-xs text-gray-600 mt-1">{t('product.fast_shipping')}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
                        <Shield size={26} className="text-cyan-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">24 {t('product.months')}</span>
                      <span className="text-xs text-gray-600 mt-1">{t('product.full_warranty')}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-cyan-200/50">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center text-center">
                        <CheckCircle size={22} className="text-cyan-600 mb-2" />
                        <span className="text-xs font-medium text-gray-700">{t('product.quality_certified')}</span>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <Star size={22} className="text-cyan-600 mb-2" />
                        <span className="text-xs font-medium text-gray-700">{t('product.premium_quality')}</span>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <Sparkles size={22} className="text-cyan-600 mb-2" />
                        <span className="text-xs font-medium text-gray-700">{t('product.easy_installation')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Presentation */}
          {(product.video || productVideos.length > 0) && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('product.video_presentation')}</h2>
              <div className="space-y-4">
                {productVideos.map((video) => {
                  const isYouTube = video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be');

                  return (
                    <div key={video.id} className="bg-white rounded-lg border p-4">
                      {video.title && (
                        <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                      )}
                      <div className="relative aspect-video">
                        {isYouTube ? (
                          <iframe
                            src={video.video_url}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video.video_url}
                            className="w-full h-full rounded-lg"
                            controls
                            poster={getImageUrl(product.image)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {product.video && (
                  <div className="bg-white rounded-lg border p-4">
                    <div className="relative aspect-video">
                      <video
                        src={product.video}
                        className="w-full h-full rounded-lg"
                        controls
                        poster={getImageUrl(product.image)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{t(`products.${product.id}.name`)}</h1>
          <p className="text-lg text-gray-600 mb-4">{t(`products.${product.id}.description`)}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {reviews.length > 0 ? (
                  <>
                    {averageRating.toFixed(1)} ({reviews.length} {
                      reviews.length === 1 ? 'review' :
                      'reviews'
                    })
                  </>
                ) : (
                  'No reviews'
                )}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            {/* Introduction */}
            {intro && (
              <div className="mb-4">
                {/* Features */}
                <div className="bg-white rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {t(`products.${product.id}.features`, { returnObjects: true }).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-cyan-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Control Options */}
                <div className="bg-white rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    {t('product_page.control_options_title')}:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {t(`products.${product.id}.control_options`, { returnObjects: true }).map((option: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Radio size={14} className="text-cyan-500" />
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Length Selection */}
                <div className="mb-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t('product.length')}</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLengthOptions(!showLengthOptions)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white"
                      aria-expanded={showLengthOptions}
                      aria-haspopup="listbox"
                    >
                      <span>{selectedVariant ? `${selectedVariant.length} ${t('product.meters_unit')}` : t('product.select_length')}</span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-500 transition-transform ${showLengthOptions ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showLengthOptions && (
                      <div
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                        role="listbox"
                      >
                        {product.variants.map(variant => (
                          <button
                            key={variant.id}
                            role="option"
                            aria-selected={selectedVariant?.id === variant.id}
                            onClick={() => handleVariantChange(variant)}
                            className={`w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors ${
                              selectedVariant?.id === variant.id ? 'bg-cyan-50 text-cyan-600' : ''
                            }`}
                          >
                            {variant.length} {t('product.meters_unit')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-3xl font-bold mt-6 mb-4">
                  <div className="relative h-10">
                    {selectedVariant ? (
                      <div className={`absolute inset-0 flex items-center transition-opacity duration-300 ${
                        priceTransition === 'fade-out' ? 'opacity-0' : 
                        priceTransition === 'fade-in' ? 'opacity-100' : 
                        isLoadingVariant ? 'opacity-0' : 'opacity-100'
                      }`} aria-live="polite">
                        {formatPrice(totalPrice !== null ? totalPrice : selectedVariant.price)}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center">
                        Select length
                      </div>
                    )}
                    
                    {/* Loading skeleton */}
                    {isLoadingVariant && (
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                <AddToCartAnimation 
                  onAddToCart={() => selectedVariant && addToCart({
                    ...product,
                    variant: {
                      ...selectedVariant,
                      price: totalPrice !== null ? totalPrice : selectedVariant.price
                    },
                    warranty: selectedWarranty
                  })}
                  onGoToCheckout={() => navigate('/checkout')}
                >
                  <button
                    disabled={!selectedVariant}
                    className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 transition-colors mb-4"
                  >
                    <CartIcon size={20} />
                    {t('product.add_to_cart')}
                  </button>
                </AddToCartAnimation>

                <div className="mt-4">
                  <button
                    onClick={() => setShowCustomOrderForm(!showCustomOrderForm)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    {t('product.order_custom')}
                  </button>
                </div>

                {/* Custom Order Form */}
                {showCustomOrderForm && (
                  <div className="mt-4 bg-cyan-50 rounded-lg p-6 border border-cyan-100 animate-fadeIn">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tool className="text-cyan-600" />
                      {t('product_page.custom_configuration')}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {t('product_page.adapt_kit')}
                    </p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-cyan-600" />
                        <span>{t('product_page.change_strip_length')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-cyan-600" />
                        <span>{t('product_page.add_controllers')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-cyan-600" />
                        <span>{t('product_page.different_control_type')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-cyan-600" />
                        <span>{t('product_page.smart_home')}</span>
                      </li>
                    </ul>

                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('product_page.desired_length')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                          placeholder={t('product_page.placeholder_example')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('product_page.control_type')}
                        </label>
                        <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500">
                          <option value="">{t('product_page.select_control_type')}</option>
                          <option value="remote">{t('product_page.remote_control')}</option>
                          <option value="wifi">{t('product_page.wifi')}</option>
                          <option value="bluetooth">{t('product_page.bluetooth')}</option>
                          <option value="smart-home">{t('product_page.smart_home_option')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('product_page.additional_requirements')}
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                          placeholder={t('product_page.requirements_placeholder')}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {t('product_page.attach_files')}
                        </label>
                        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 transition-colors">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="hidden"
                            id="file-upload"
                            accept=".jpg,.jpeg,.png,.pdf,.dwg,.dxf"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-gray-600">
                              <Upload size={20} className="text-cyan-500" />
                              <span>{t('product_page.drag_files')}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              {t('product_page.supported_formats')}
                            </p>
                          </label>
                          {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {Array.from(selectedFiles).map((file, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                  <FileText size={16} className="text-cyan-500" />
                                  <span>{file.name}</span>
                                  <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Info size={14} />
                          {t('product_page.email_files')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('product_page.your_email')}
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('product_page.phone_number')}
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                          placeholder="+420 XXX XXX XXX"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Send size={20} />
                        {t('product_page.send_request')}
                      </button>
                    </form>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Package size={20} />
                  <span>{t('product.in_stock')} • {t('product.free_delivery')} • <Link to="/warranty" className="text-cyan-600 hover:underline">{t('product.warranty_24_months')}</Link></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b mt-12">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-lg text-gray-700">
                <p>{t(`products.${product.id}.overview_text`)}</p>
              </div>
            </div>
            <TrustIndicators />
            <SocialProof />
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-8">
            <ComparisonTable />
            {/* Product description sections */}
            <ProductRecommendations 
              currentProduct={product}
              products={products}
            />
            <div className="space-y-4">
              {contentSections.map((section) => (
                <div key={section.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between text-left p-4 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Info size={18} className="text-cyan-600" />
                      <span className="text-gray-700">{section.title}</span>
                    </span>
                    {openSections[section.title] ? (
                      <ChevronUp size={16} className="flex-shrink-0 text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="flex-shrink-0 text-gray-500" />
                    )}
                  </button>
                  {openSections[section.title] && (
                    <div className="border-t">
                      {section.content && (
                        <div className="p-6 bg-gray-50 prose prose-sm max-w-none">
                          <ReactMarkdown>{section.content}</ReactMarkdown>
                        </div>
                      )}
                      {section.subsections.map((subsection) => (
                        <div key={subsection.title} className="border-t">
                          <button
                            onClick={() => toggleSubsection(subsection.title)}
                            className="w-full flex items-center justify-between text-left p-4 hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-medium text-cyan-600">
                              {subsection.title}
                            </span>
                            {openSubsections[subsection.title] ? (
                              <ChevronUp size={16} className="flex-shrink-0 text-gray-500" />
                            ) : (
                              <ChevronDown size={16} className="flex-shrink-0 text-gray-500" />
                            )}
                          </button>
                          {openSubsections[subsection.title] && (
                            <div className="p-6 bg-white prose prose-sm max-w-none border-t">
                              <ReactMarkdown>{subsection.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <LightingCalculator />
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <ProjectGallery />
            <InstallationTimeline />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{t('product_page.reviews_title')}</h2>
              <button
                onClick={() => setIsReviewFormVisible(!isReviewFormVisible)}
                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                {t('product_page.leave_review')}
              </button>
            </div>

            {isReviewFormVisible && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">{t('product_page.new_review')}</h3>
                <ReviewForm onSubmit={handleReviewSubmit} />
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-gray-600">{t('product_page.loading_reviews')}</div>
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </div>
        )}
      </div>

      <RecentlyViewed />

      {/* AI Image Editor Modal */}
      {showAIEditor && currentImageForAI && (
        <AIImageEditor
          imageUrl={currentImageForAI}
          onImageProcessed={handleImageProcessed}
          onClose={() => setShowAIEditor(false)}
        />
      )}
    </main>
  );
}

export default ProductPage;