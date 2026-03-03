# Blog Locale Issues - РАДИКАЛЬНЫЙ FIX (URL = Source of Truth)

## Суть проблемы

Blog list и BlogPost использовали `language` из LocaleContext, который мог рассинхронизироваться с URL. Это вызывало:
- Прыжки RU/EN постов при обновлении `/ru/blog/`
- 404 при переключении языка на blog post

## Решение: URL как единственный источник истины

### Принцип
```
URL параметр :locale → useParams() → normalize → использовать везде
НЕ использовать: i18n.language, LocaleContext.language для фильтра данных
```

## Изменённые файлы

### 1. src/pages/Blog.tsx
**До:**
```tsx
const { language, locale } = useLocale();
useEffect(() => {
  if (locale) {
    loadPosts();
  }
}, [locale]);

.eq('locale', locale)  // но locale мог не совпадать с URL!
```

**После:**
```tsx
const { locale: urlLocale } = useParams<{ locale: string }>();
const locale = urlLocale === 'ru' ? 'ru' : 'en';  // normalize

useEffect(() => {
  console.log(`[Blog] locale from URL: "${locale}", i18n.language: "${i18n.language}"`);
  loadPosts();
}, [locale]);

.eq('locale', locale)  // теперь locale ТОЧНО из URL
```

**Что изменено:**
- Добавлен `useParams()` для получения locale из URL
- Удален `useLocale()` hook
- Нормализация locale: `urlLocale === 'ru' ? 'ru' : 'en'`
- formatDate использует `locale` вместо `language`

### 2. src/pages/BlogPost.tsx
**До:**
```tsx
const { slug } = useParams<{ slug: string }>();
const { language, locale } = useLocale();
```

**После:**
```tsx
const { slug, locale: urlLocale } = useParams<{ slug: string; locale: string }>();
const locale = urlLocale === 'ru' ? 'ru' : 'en';

console.log(`[BlogPost] locale from URL: "${locale}", i18n.language: "${i18n.language}"`);
```

**Что изменено:**
- locale теперь берется из URL параметра
- Удален `useLocale()` hook
- formatDate использует `locale` вместо `language`
- Загрузка поста строго по `slug + locale` из URL

### 3. src/components/LocaleWrapper.tsx
**Без изменений функциональности** - уже работает правильно:
- Синхронизирует URL → i18n (не наоборот)
- Не делает автоматических редиректов (кроме invalid locale)

### 4. src/components/LocaleSwitcher.tsx
**Без изменений функциональности** - уже работает правильно через translations context

## Архитектура

```
URL /:locale/blog/
  ↓
useParams() → locale
  ↓
LocaleWrapper → синхронизирует i18n.changeLanguage(locale)
  ↓
Blog.tsx → useParams() → .eq('locale', locale)
  ↓
Posты загружаются строго по locale из URL
```

## Проверка

```bash
npm run build
npm run preview
```

### Тест 1: RU blog list стабилен

```bash
# Откройте http://localhost:4173/ru/blog/
# F5 x 10 раз подряд
```

**Ожидаемые логи:**
```
[LocaleWrapper] pathname="/ru/blog/", locale="ru", i18n.language="ru"
[Blog] locale from URL: "ru", i18n.language: "ru"
[Blog] Loaded 2 posts for locale="ru"
```

**Результат:** Всегда RU посты, нет прыжков

### Тест 2: EN blog list стабилен

```bash
# Откройте http://localhost:4173/en/blog/
# F5 x 10 раз подряд
```

**Ожидаемые логи:**
```
[LocaleWrapper] pathname="/en/blog/", locale="en", i18n.language="en"
[Blog] locale from URL: "en", i18n.language: "en"
[Blog] Loaded 2 posts for locale="en"
```

**Результат:** Всегда EN посты, нет прыжков

### Тест 3: Переключение языка на посте RU → EN

```bash
# Откройте http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
# Кликните на переключатель → English
```

**Ожидаемые логи:**
```
[BlogPost] locale from URL: "ru", i18n.language: "ru"
[BlogPost] Loading post: slug="osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi", locale="ru"
[BlogPost] Setting translations: {en: "/en/blog/children-room-lighting-cri-color-rendering/", ru: "/ru/blog/..."}
[LocaleSwitcher] Switching to en, pathname="/ru/blog/...", isBlogPost=true
[LocaleSwitcher] Found translation for en: /en/blog/children-room-lighting-cri-color-rendering/
```

**Результат:** Переход на `/en/blog/children-room-lighting-cri-color-rendering/`

### Тест 4: Переключение языка на посте EN → RU

**Результат:** Переход на `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`

### Тест 5 & 6: F5 на постах

- F5 на RU посте → загружается RU пост, без редиректов
- F5 на EN посте → загружается EN пост, без редиректов

## Логика работы

### Blog List
1. URL: `/ru/blog/` → `useParams()` → `locale = "ru"`
2. `useEffect([locale])` → `loadPosts()`
3. Supabase: `.eq('locale', "ru")` → только RU посты
4. i18n.language синхронизируется LocaleWrapper, но НЕ используется для фильтра

### Blog Post
1. URL: `/ru/blog/slug/` → `useParams()` → `locale = "ru", slug = "..."`
2. `loadPost()` → `.eq('slug', slug).eq('locale', locale)`
3. Если пост не найден → 404 (без fallback на другую локаль)
4. `loadAlternateUrls(translation_group_id)` → заполняет translations
5. LocaleSwitcher использует translations для переключения

### Language Switch
1. LocaleSwitcher получает translations из context
2. При клике на язык: `translations[targetLocale]` → navigate
3. Если перевода нет: `navigate(/${targetLocale}/blog/)`

## Критичные моменты

✅ **ВСЕГДА используйте useParams() для locale**
```tsx
const { locale: urlLocale } = useParams<{ locale: string }>();
const locale = urlLocale === 'ru' ? 'ru' : 'en';
```

❌ **НЕ используйте для фильтра данных:**
```tsx
const { language } = useLocale();  // ❌ может рассинхронизироваться
const { i18n } = useTranslation();
.eq('locale', i18n.language)  // ❌ может быть не синхронен с URL
```

✅ **Используйте i18n.language только для:**
- Переводов UI: `t('key')`
- Форматирования (если locale не доступен в scope)

✅ **LocaleWrapper синхронизирует URL → i18n**
- Это гарантирует что i18n.language всегда соответствует URL
- Но для данных все равно используйте locale из useParams()

## Отладка

### Проблема: посты все еще прыгают

**Проверьте логи:**
```
[Blog] locale from URL: "ru", i18n.language: "en"  // ← плохо, не синхронны
```

**Решение:** Убедитесь что LocaleWrapper рендерится и вызывает `i18n.changeLanguage(locale)`

### Проблема: 404 при переключении языка

**Проверьте логи:**
```
[LocaleSwitcher] Not a blog post or no translations, using default behavior
```

**Причины:**
1. `translations` пустой → проверьте `[BlogPost] Setting translations:`
2. translation_group_id не совпадает между постами
3. Пост не опубликован (published = false)

**SQL проверка:**
```sql
SELECT locale, slug, translation_group_id, published
FROM blog_posts
WHERE translation_group_id = '414465aa-b3c2-4959-95e4-988930c90491'
ORDER BY locale;
```

Должно вернуть:
```
en | children-room-lighting-cri-color-rendering | 414465aa... | true
ru | osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi | 414465aa... | true
```

## Итог

✅ URL является единственным источником истины для locale
✅ Blog.tsx и BlogPost.tsx используют `useParams()` напрямую
✅ Нормализация locale: `ru` или `en`
✅ Нет рассинхронизации между URL и данными
✅ LocaleWrapper синхронизирует URL → i18n (не наоборот)
✅ Debug логи добавлены для отладки

**Файлы:**
- src/pages/Blog.tsx
- src/pages/BlogPost.tsx
