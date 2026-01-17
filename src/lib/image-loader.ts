// Функция для предварительной загрузки изображений
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.loading = 'eager';
    img.decoding = 'async';
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Image loading queue to prevent too many concurrent requests
class ImageLoadQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private maxConcurrent = 4;

  async add(task: () => Promise<void>) {
    this.queue.push(task);
    this.processQueue();
  }

  private async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } catch (error) {
        console.error('Image loading error:', error);
      } finally {
        this.running--;
        this.processQueue();
      }
    }
  }
}

const imageQueue = new ImageLoadQueue();

// Функция для оптимизации изображений
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return '';
  
  // Handle data URLs
  if (url.startsWith('data:')) {
    return url;
  }

  // Handle Unsplash URLs
  if (url.includes('unsplash.com')) {
    const base = url.split('?')[0];
    const params = new URLSearchParams({
      w: (width || 800).toString(),
      q: '80',
      fm: 'webp',
      fit: 'crop',
      auto: 'compress'
    });
    return `${base}?${params.toString()}`;
  }
  
  // Handle Supabase Storage URLs - return the URL as-is
  if (url.includes('storage.googleapis.com') || url.includes('supabase.co')) {
    return url;
  }

  return url;
}

export function generateSrcSet(url: string): string {
  // Optimize widths based on device pixel ratios
  const widths = [360, 480, 768, 1024, 1280, 1920];
  return widths
    .map(w => `${getOptimizedImageUrl(url, w)} ${w}w`)
    .join(', ');
}

// Preload critical images with priority
async function preloadCriticalImages(images: string[]) {
  await Promise.all(images.map(src => new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getOptimizedImageUrl(src, 1024); // Higher quality for critical images
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    
    imageQueue.add(async () => {
      try {
        await preloadImage(link.href);
        resolve();
      } catch (error) {
        console.error(`Failed to preload image ${src}:`, error);
        resolve(); // Resolve anyway to not block other images
      }
    });
  })));
}