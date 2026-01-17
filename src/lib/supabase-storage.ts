import { supabase } from './supabase';

const LOGO_SIZES = {
  large: 512,
  medium: 256,
  small: 128,
  favicon: 32
};

export function getImageUrl(path: string): string {
  if (!path || typeof path !== 'string') {
    return path;
  }

  // If it's already a full URL, return it as is
  if (path.startsWith('http')) {
    return path;
  }

  // Remove any storage path prefixes and clean up slashes
  const cleanPath = path
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(/^product-images\//, '');

  return `${supabase.supabaseUrl}/storage/v1/object/public/product-images/${cleanPath}`;
}

export async function uploadLogo(file: File): Promise<string | null> {
  try {
    if (!file) {
      throw new Error('Пожалуйста, выберите файл');
    }

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      throw new Error('Поддерживаются PNG, JPEG, WebP и SVG файлы');
    }

    // Validate file size
    if (file.size > 1024 * 1024) {
      const sizeInKB = Math.round(file.size / 1024);
      throw new Error(`Файл слишком большой (${sizeInKB}KB). Максимальный размер: 1MB`);
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `site-logo-${timestamp}-${randomString}.png`;
    const filePath = `logo/${fileName}`;

    // Upload file
    const { error: uploadError, data } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      });

    if (uploadError) {
      throw new Error(
        uploadError.message.includes('duplicate') ? 'Файл с таким именем уже существует' :
        uploadError.message.includes('size') ? `Превышен лимит размера файла (${Math.round(file.size / 1024)}KB)` :
        uploadError.message.includes('type') ? 'Неподдерживаемый тип файла' :
        `Ошибка при загрузке: ${uploadError.message}`
      );
    }

    if (!data?.path) {
      throw new Error('Не удалось получить информацию о загруженном файле');
    }

    // Get the public URL using the returned path
    const { data: urlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Не удалось получить публичную ссылку на логотип');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadLogo:', error);
    throw error;
  }
}

export function addCacheBuster(url: string): string {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

export async function uploadImage(file: File, folder: string = 'products'): Promise<string | null> {
  try {
    if (!file) {
      throw new Error('Пожалуйста, выберите файл');
    }

    // Determine file type and validate
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      throw new Error('Неподдерживаемый тип файла. Разрешены только изображения и видео.');
    }

    // Validate file size
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for images
    if (file.size > maxSize) {
      const sizeInMB = Math.round(file.size / 1024 / 1024);
      const limit = maxSize / 1024 / 1024;
      throw new Error(`Размер файла (${sizeInMB}MB) превышает лимит в ${limit}MB`);
    }

    // Generate a unique filename with timestamp to avoid caching issues
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `${folder}/${randomString}${timestamp}.${fileExt}`;

    // Determine bucket based on file type
    const bucket = isVideo ? 'product-videos' : 'product-images';

    // Upload file with upsert: false to ensure a new file is created
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half'
      });

    if (uploadError) {
      if (uploadError.message.includes('duplicate')) {
        throw new Error('Файл с таким именем уже существует');
      } else if (uploadError.message.includes('size')) {
        throw new Error(`Превышен лимит размера файла (${Math.round(file.size / 1024 / 1024)}MB)`);
      } else if (uploadError.message.includes('type')) {
        throw new Error('Неподдерживаемый тип файла');
      } else {
        throw new Error(`Ошибка при загрузке: ${uploadError.message}`);
      }
    }

    if (!data) {
      throw new Error('Не удалось загрузить файл. Пожалуйста, попробуйте еще раз.');
    }

    // Get the public URL with cache buster
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error('Не удалось получить ссылку на загруженный файл');
    }

    return addCacheBuster(publicUrl);
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}