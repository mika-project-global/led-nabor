# URL-based Localization Guide

Этот проект использует URL-based локализацию с React Router, где каждая страница доступна через `/:locale/*` префикс.

## Поддерживаемые локали

- `en` - English (по умолчанию)
- `de` - Deutsch
- `pl` - Polski
- `cz` - Čeština
- `ru` - Русский

## Структура URL

### Новые URL с локалями

Все страницы теперь доступны через `/:locale/` префикс:

- `/en/` - Главная страница (каталог)
- `/en/catalog` - Каталог товаров
- `/en/product/:productId` - Страница товара
- `/en/category/:categoryId` - Категория товаров
- `/en/faq` - FAQ
- `/en/about` - О нас
- `/en/warranty` - Гарантия
- `/en/blog` - Блог
- `/en/blog/:slug` - Статья блога

### Примеры работающих URL

```
/en/
/en/catalog
/en/product/1
/en/product/2
/en/category/rgb_cct
/en/category/cct
/en/faq
/en/about
/en/warranty
/en/blog

/de/
/de/catalog
/de/product/1
...

/pl/
/pl/catalog
...

/cz/
/cz/catalog
...
```

### Старые URL (301 redirect)

Старые URL без локали автоматически редиректят на английскую версию:

- `/catalog` → `/en/catalog` (301)
- `/product/1` → `/en/product/1` (301)
- `/product/2` → `/en/product/2` (301)
- `/category/rgb_cct` → `/en/category/rgb_cct` (301)
- `/category/cct` → `/en/category/cct` (301)
- `/faq` → `/en/faq` (301)
- `/about` → `/en/about` (301)
- `/warranty` → `/en/warranty` (301)
- `/blog` → `/en/blog` (301)

### Root redirect

- `/` → `/en/` (client-side redirect через Navigate)

## Архитектура

### 1. LocaleWrapper компонент

`src/components/LocaleWrapper.tsx` - обертка, которая:
- Извлекает `locale` из URL параметра
- Валидирует что локаль поддерживается
- Синхронизирует локаль с i18next и LocaleContext
- Редиректит неизвестные локали на `/en/`

```tsx
<Route path="/:locale/*" element={
  <LocaleWrapper>
    <Routes>
      <Route path="/" element={<Catalog />} />
      {/* ... другие маршруты */}
    </Routes>
  </LocaleWrapper>
} />
```

### 2. LocaleSwitcher компонент

`src/components/LocaleSwitcher.tsx` - переключатель языка который:
- Показывает текущую локаль из URL
- При смене языка меняет URL (например `/en/product/1` → `/de/product/1`)
- Сохраняет текущий путь и query параметры

```tsx
const handleLanguageChange = (langCode: string) => {
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length > 0 && LANGUAGES.some(l => l.code === pathSegments[0])) {
    pathSegments[0] = langCode;
    const newPath = '/' + pathSegments.join('/') + location.search;
    navigate(newPath);
  }
};
```

### 3. SEO компонент

`src/components/SEO.tsx` - обновлен для динамических locale:
- Читает `locale` из URL параметра через `useParams()`
- Устанавливает `canonical` URL с локалью (например `https://led-nabor.com/en/product/1`)
- Устанавливает `og:locale` динамически (en_US, de_DE, pl_PL, cs_CZ, ru_RU)
- Добавляет `og:locale:alternate` для других локалей
- Устанавливает `og:url` с полным путем включая локаль

```tsx
const { locale = 'en' } = useParams<{ locale: string }>();
const ogLocale = LOCALE_MAP[locale] || 'en_US';
const fullCanonicalUrl = canonicalUrl || `${siteUrl}${location.pathname}`;

<link rel="canonical" href={fullCanonicalUrl} />
<meta property="og:locale" content={ogLocale} />
<meta property="og:url" content={fullCanonicalUrl} />
```

### 4. LocaleContext

`src/context/LocaleContext.tsx` - обновлен для поддержки 5 локалей:
- Добавлены `de`, `pl`, `cz` в список поддерживаемых языков
- Синхронизируется с LocaleWrapper через `setLanguage()`

## Netlify конфигурация

`netlify.toml` содержит 301 редиректы для старых URL:

```toml
# 301 redirects to English locale (SEO-friendly permanent redirects)
[[redirects]]
from = "/catalog"
to = "/en/catalog"
status = 301

[[redirects]]
from = "/product/1"
to = "/en/product/1"
status = 301

# ... другие редиректы

# Catchall for SPA routing
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
# No force = true, so prerendered HTML files take priority
```

## Prerendering

`scripts/prerender.mjs` обновлен для prerender новых URL:

```javascript
const routes = [
  '/en/',
  '/en/catalog',
  '/en/product/1',
  '/en/product/2',
  '/en/category/rgb_cct',
  '/en/category/cct',
  '/en/faq',
  '/en/about',
  '/en/warranty',
  '/en/blog'
];
```

### Prerendered файлы

После `npm run build:prerender` создаются:

```
dist/
├── en/
│   ├── index.html
│   ├── catalog/
│   │   └── index.html
│   ├── product/
│   │   ├── 1/index.html
│   │   └── 2/index.html
│   ├── category/
│   │   ├── rgb_cct/index.html
│   │   └── cct/index.html
│   ├── faq/index.html
│   ├── about/index.html
│   ├── warranty/index.html
│   └── blog/index.html
└── index.html (root SPA fallback)
```

## SEO теги в prerendered HTML

Каждая prerendered страница содержит:

### Базовые теги
- `<title>` с правильным заголовком
- `<meta name="description">` с описанием
- `<link rel="canonical">` с полным URL включая локаль

### OpenGraph теги
- `og:title` - заголовок страницы
- `og:description` - описание
- `og:type` - тип контента (website, product, article)
- `og:image` - изображение для превью
- `og:url` - полный URL с локалью
- `og:locale` - текущая локаль (en_US, de_DE, etc.)
- `og:locale:alternate` - альтернативные локали

### Twitter Card теги
- `twitter:card` - тип карточки
- `twitter:title` - заголовок
- `twitter:description` - описание
- `twitter:image` - изображение

### Schema.org JSON-LD
- Product schema для страниц товаров с ценой, наличием, рейтингом
- Article schema для блога

## Проверка SEO

### Проверить canonical и og:locale

```bash
curl https://led-nabor.com/en/product/1 | grep -E 'canonical|og:locale|og:url'
```

### Локальная проверка

```bash
# Build и prerender
npm run build:prerender

# Запустить локальный сервер
npm run preview:prerendered

# Открыть в браузере
# http://localhost:3000/en/
# http://localhost:3000/en/product/1
```

### Проверить view-source

```bash
curl http://localhost:3000/en/product/1/ | grep '<title>'
curl http://localhost:3000/en/product/1/ | grep 'og:locale'
curl http://localhost:3000/en/product/1/ | grep 'canonical'
```

## Добавление новых локалей

### 1. Добавить локаль в LocaleWrapper

```tsx
const SUPPORTED_LOCALES = ['en', 'de', 'pl', 'cz', 'ru', 'fr']; // добавить 'fr'
```

### 2. Добавить локаль в LOCALE_MAP (SEO.tsx)

```tsx
const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  de: 'de_DE',
  pl: 'pl_PL',
  cz: 'cs_CZ',
  ru: 'ru_RU',
  fr: 'fr_FR' // добавить
};
```

### 3. Добавить в LocaleSwitcher

```tsx
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cz', name: 'Čeština', flag: '🇨🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' } // добавить
];
```

### 4. Добавить переводы в i18n

Создать `src/i18n/locales/fr.json` и импортировать в `src/i18n/index.ts`

### 5. (Опционально) Добавить в prerender

```javascript
const routes = [
  // ...existing routes
  '/fr/',
  '/fr/catalog',
  '/fr/product/1',
  // ...
];
```

## Миграция старых URL

Все старые URL автоматически редиректят на `/en/` версию через 301 redirect в Netlify.

Google будет постепенно индексировать новые URL и переносить SEO вес на них.

### Проверка в Google Search Console

1. Откройте Google Search Console
2. URL Inspection tool
3. Проверьте старый URL (например `/product/1`)
4. Убедитесь что редирект 301 на `/en/product/1`
5. Запросите переиндексацию нового URL

## Troubleshooting

### Бесконечный редирект

Если возникает бесконечный редирект, проверьте:
- LocaleWrapper использует `hasSetLanguage.current` для предотвращения повторных setLanguage
- Root redirect `/` использует `replace` флаг

### Локаль не меняется

Проверьте:
- LocaleSwitcher правильно парсит URL
- LocaleWrapper правильно читает `locale` из params
- i18next получает обновление через `setLanguage()`

### Prerender не работает

Проверьте:
- Таймауты достаточно большие (90 секунд)
- Serve handler правильно настроен с SPA fallback
- Страница не делает бесконечных запросов

### SEO теги не появляются

Проверьте:
- Компонент `<SEO>` используется на странице
- `react-helmet-async` правильно настроен
- Prerender script ждет достаточно времени (2.5 секунды) после загрузки
