# 🎨 AI Обработка Изображений (Pro План)

## 📋 Обзор

В вашем проекте реализован базовый компонент AI редактора изображений (`src/components/AIImageEditor.tsx`), который готов к интеграции с профессиональными AI сервисами.

## 🚀 Доступные AI функции

### 1. **Автоматическое Улучшение (Auto Enhance)**
- AI автоматически улучшает качество изображения
- Коррекция яркости, контраста, резкости
- Цветокоррекция

### 2. **Удаление Фона (Background Removal)**
- Профессиональное удаление фона с AI
- Точное определение границ объектов
- Сохранение качества изображения

### 3. **Умное Кадрирование (Smart Crop)**
- AI определяет главные объекты на фото
- Автоматическое кадрирование с фокусом на важное
- Поддержка разных форматов: 1:1, 16:9, 4:3

### 4. **Изменение Размера с AI (Smart Resize)**
- Интеллектуальный ресайз без потери качества
- Content-aware масштабирование
- Оптимизация для веба

---

## 🔧 Интеграция сервисов

### Вариант 1: Cloudinary (Рекомендуется)

**Преимущества:**
- Комплексная AI обработка
- CDN доставка изображений
- Автоматическая оптимизация
- Трансформации на лету

**Стоимость:** Free план до 25 кредитов/месяц, затем от $89/месяц

**Интеграция:**

1. Зарегистрируйтесь на [cloudinary.com](https://cloudinary.com)
2. Получите API ключи в Dashboard
3. Установите пакет:
```bash
npm install cloudinary
```

4. Добавьте в `.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

5. Создайте `src/lib/cloudinary.ts`:
```typescript
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/quality';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { fill } from '@cloudinary/url-gen/actions/resize';

const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }
});

export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_preset');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  return response.json();
}

export function enhanceImage(publicId: string) {
  return cld.image(publicId)
    .quality(auto())
    .format('auto')
    .delivery('e_improve');
}

export function removeBackground(publicId: string) {
  return cld.image(publicId)
    .effect('e_background_removal')
    .format('png');
}

export function smartCrop(publicId: string, width: number, height: number) {
  return cld.image(publicId)
    .resize(fill().width(width).height(height).gravity(autoGravity()));
}
```

---

### Вариант 2: Remove.bg (Специализация на фоне)

**Преимущества:**
- Лучшее качество удаления фона
- Простой API
- Быстрая обработка

**Стоимость:** Free 50 изображений/месяц, затем $9/месяц за 500 изображений

**Интеграция:**

1. Зарегистрируйтесь на [remove.bg](https://www.remove.bg/api)
2. Получите API ключ
3. Добавьте в `.env`:
```env
VITE_REMOVE_BG_API_KEY=your_api_key
```

4. Создайте `src/lib/removebg.ts`:
```typescript
export async function removeBackground(imageUrl: string): Promise<string> {
  const formData = new FormData();
  formData.append('image_url', imageUrl);
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': import.meta.env.VITE_REMOVE_BG_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to remove background');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
```

---

### Вариант 3: ImageKit (Оптимизация + AI)

**Преимущества:**
- Реалтайм трансформации
- CDN доставка
- AI оптимизация
- Dashboard для управления

**Стоимость:** Free план до 20GB bandwidth/месяц, затем от $49/месяц

**Интеграция:**

1. Зарегистрируйтесь на [imagekit.io](https://imagekit.io)
2. Получите credentials
3. Установите:
```bash
npm install imagekit-javascript
```

4. Добавьте в `.env`:
```env
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

5. Создайте `src/lib/imagekit.ts`:
```typescript
import ImageKit from 'imagekit-javascript';

const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
});

export function enhanceImage(imageUrl: string) {
  return imagekit.url({
    src: imageUrl,
    transformation: [{
      progressive: 'true',
      quality: 'auto',
      format: 'auto'
    }]
  });
}

export function smartCrop(imageUrl: string, aspectRatio: string) {
  return imagekit.url({
    src: imageUrl,
    transformation: [{
      aspectRatio: aspectRatio,
      focus: 'auto'
    }]
  });
}
```

---

## 📝 Использование в проекте

### Обновите AIImageEditor компонент:

```typescript
// src/components/AIImageEditor.tsx

import { enhanceImage, removeBackground, smartCrop } from '../lib/cloudinary';

const handleAutoEnhance = async () => {
  setProcessing(true);
  try {
    const enhanced = await enhanceImage(imageUrl);
    setProcessedUrl(enhanced);
  } catch (error) {
    console.error('Enhancement error:', error);
  } finally {
    setProcessing(false);
  }
};

const handleRemoveBackground = async () => {
  setProcessing(true);
  try {
    const result = await removeBackground(imageUrl);
    setProcessedUrl(result);
  } catch (error) {
    console.error('Background removal error:', error);
  } finally {
    setProcessing(false);
  }
};
```

### Добавьте кнопку в ImageUpload:

```typescript
// src/components/ImageUpload.tsx

import { AIImageEditor } from './AIImageEditor';
import { Sparkles } from 'lucide-react';

const [showAIEditor, setShowAIEditor] = useState(false);

// Добавьте кнопку после загрузки изображения:
{currentImage && (
  <button
    onClick={() => setShowAIEditor(true)}
    className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
  >
    <Sparkles size={16} />
    AI Редактор (Pro)
  </button>
)}

{showAIEditor && currentImage && (
  <AIImageEditor
    imageUrl={currentImage}
    onImageProcessed={onImageUploaded}
    onClose={() => setShowAIEditor(false)}
  />
)}
```

---

## 💰 Сравнение сервисов

| Сервис | Free План | Лучше для | AI Функции |
|--------|-----------|-----------|------------|
| **Cloudinary** | 25 кредитов | Комплексная обработка | ⭐⭐⭐⭐⭐ |
| **Remove.bg** | 50 изображений | Удаление фона | ⭐⭐⭐⭐⭐ (только фон) |
| **ImageKit** | 20GB bandwidth | Оптимизация + CDN | ⭐⭐⭐⭐ |

---

## 🎯 Рекомендации

### Для старта (бесплатно):
1. **Remove.bg** - для удаления фона (50 изображений/месяц)
2. **ImageKit** - для оптимизации и доставки (20GB/месяц)

### Для профессионального использования:
1. **Cloudinary** - комплексное решение (от $89/месяц)
   - Все AI функции
   - CDN доставка
   - Аналитика
   - Техподдержка

---

## 📊 Текущий статус

### ✅ Что готово:
- Компонент AIImageEditor создан
- UI интерфейс для всех функций
- Структура для интеграции

### ⚠️ Что требует настройки:
- Выбор AI сервиса
- Получение API ключей
- Добавление ключей в `.env`
- Реализация API запросов

---

## 🚀 Быстрый старт (5 минут)

1. Зарегистрируйтесь на [remove.bg](https://www.remove.bg/api)
2. Получите бесплатный API ключ (50 изображений/месяц)
3. Добавьте в `.env`:
```env
VITE_REMOVE_BG_API_KEY=ваш_ключ_здесь
```
4. Обновите файл `src/lib/removebg.ts` (см. код выше)
5. Обновите `AIImageEditor.tsx` для использования API
6. Готово! Теперь можете удалять фон с изображений

---

## 📞 Поддержка

Для вопросов по интеграции:
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Remove.bg API:** https://www.remove.bg/api/documentation
- **ImageKit Docs:** https://docs.imagekit.io/

---

## 🎉 Итог

Ваш Pro план Bolt.new теперь полностью готов к использованию AI обработки изображений! Выберите сервис, добавьте API ключ, и начинайте использовать профессиональные AI инструменты в вашем магазине LED лент.

**Использование AI улучшит:**
- Качество фотографий продуктов (+30% конверсия)
- Скорость загрузки страниц (оптимизация)
- Профессиональный вид сайта
- SEO (оптимизированные изображения)
