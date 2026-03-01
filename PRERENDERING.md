# Prerendering для SEO

Этот проект использует prerendering для генерации статических HTML страниц с полными SEO мета-тегами для Google и других поисковых систем.

## Как это работает

1. **Build** - Vite создает production bundle в папке `dist/`
2. **Prerender** - Puppeteer открывает каждую страницу в headless браузере и сохраняет финальный HTML с:
   - `<title>` тегами
   - `<meta name="description">` тегами
   - OpenGraph тегами (og:title, og:description, og:image)
   - Twitter Card тегами
   - Schema.org JSON-LD разметкой (Product, Article)
   - Всеми другими мета-тегами из react-helmet-async

3. **Deploy** - Netlify отдает prerendered HTML для поисковых ботов и пользователей, затем React приложение гидрируется на клиенте

## Prerendered маршруты

Следующие страницы генерируются как статический HTML:

- `/` - Главная страница (каталог)
- `/catalog` - Каталог товаров
- `/product/1` - Универсальный RGB+CCT набор
- `/product/2` - Набор с регулируемым белым светом
- `/category/rgb_cct` - Категория RGB+CCT
- `/category/cct` - Категория CCT
- `/faq` - Часто задаваемые вопросы
- `/about` - О нас
- `/warranty` - Гарантия
- `/blog` - Блог

## Команды

### Production build с prerendering
```bash
npm run build:prerender
```

Эта команда:
1. Запускает `vite build`
2. Запускает `node scripts/prerender.mjs`
3. Создает prerendered HTML файлы в `dist/`

### Локальная проверка prerendered сайта
```bash
npm run preview:prerendered
```

Запускает локальный сервер на `http://localhost:3000` с prerendered файлами.

### Обычный dev режим (без prerendering)
```bash
npm run dev
```

## Проверка SEO тегов

### Проверить title и description в главной странице
```bash
curl http://localhost:3000/ | grep -E '<title>|<meta name="description"'
```

### Проверить OpenGraph теги на странице товара
```bash
curl http://localhost:3000/product/1/ | grep 'og:'
```

### Проверить Schema.org JSON-LD
```bash
curl http://localhost:3000/product/1/ | grep -A 20 'application/ld+json'
```

## Что видит Google

Google бот получает полностью отрендеренный HTML со всеми мета-тегами:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Universal RGB+CCT | LED Nabor - LED ленты для подсветки потолка</title>
    <meta name="description" content="Professional solution for creating modern lighting...">
    <meta property="og:title" content="Universal RGB+CCT">
    <meta property="og:type" content="product">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Universal RGB+CCT",
      "offers": {
        "@type": "Offer",
        "price": 5350,
        "priceCurrency": "CZK"
      }
    }
    </script>
  </head>
  <body>
    <main>
      <!-- Полный HTML контент страницы -->
    </main>
  </body>
</html>
```

## Netlify конфигурация

В `netlify.toml`:

```toml
[build]
command = "npm run build:prerender"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
# No force = true, чтобы prerendered файлы имели приоритет
```

Без `force = true` Netlify сначала ищет статический файл (например, `/product/1/index.html`), и только если его нет - использует SPA fallback.

## Добавление новых маршрутов для prerendering

Отредактируйте `scripts/prerender.mjs`:

```javascript
const routes = [
  '/',
  '/catalog',
  '/product/1',
  '/product/2',
  '/your-new-route',  // Добавьте здесь
  // ...
];
```

## Troubleshooting

### Страница не prerenderится (timeout)
- Увеличьте timeout в `prerender.mjs` (по умолчанию 60 секунд)
- Проверьте что страница не делает бесконечных запросов к API

### Мета-теги не появляются
- Убедитесь что компонент `<SEO>` используется на странице
- Проверьте что react-helmet-async оборачивает приложение в `<HelmetProvider>`
- Увеличьте задержку после загрузки страницы (по умолчанию 2 секунды)

### SPA fallback перезаписывает prerendered файлы на Netlify
- Убедитесь что в `netlify.toml` catchall redirect НЕ имеет `force = true`

## Верификация в Google Search Console

1. Перейдите в Google Search Console
2. Откройте "URL Inspection" tool
3. Введите URL (например, `https://led-nabor.com/product/1`)
4. Нажмите "Test Live URL"
5. Проверьте что в "View Crawled Page" видны все мета-теги

## CI/CD (Netlify)

### Автоматическая установка Chrome

Chrome устанавливается автоматически в CI через `postinstall` скрипт:

```json
{
  "scripts": {
    "postinstall": "npx puppeteer browsers install chrome"
  }
}
```

**Переменные окружения в netlify.toml:**
```toml
[build.environment]
PUPPETEER_CACHE_DIR = ".cache/puppeteer"
```

Это кеширует Chrome между деплоями и ускоряет сборку.

**CI-specific браузерные аргументы:**
```javascript
puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
});
```

## Пакеты

- `puppeteer` - Headless браузер для рендеринга страниц
- `serve` - Локальный HTTP сервер для тестирования
- `react-helmet-async` - Управление мета-тегами в React (уже установлен)
