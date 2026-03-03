# BLOG REDIRECT LOOP - HOTFIX COMPLETED

## Проблема
Бесконечный redirect loop на blog posts: `/ru/blog/...` перекидывало между `/ru` ↔ `/en`.

## Внесённые изменения

### 1. BlogPost.tsx - Удалена логика автоматических редиректов
**Файл:** `src/pages/BlogPost.tsx`

**Что было:**
- При загрузке поста искал его в другой локали если не найден
- Делал `navigate()` к переведенной версии → вызывало loop
- Пытался "подменить" пост через `translation_group_id`

**Что стало:**
```typescript
// Загрузка ТОЛЬКО по slug + locale из URL
const { data, error: fetchError } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('slug', slug)        // Slug из URL
  .eq('locale', locale)    // Locale из URL
  .eq('published', true)
  .maybeSingle();

if (!data) {
  // Если не найдено → 404, БЕЗ редиректов
  setError(true);
  return;
}
```

**Убран импорт:** `useNavigate` - больше не используется в BlogPost

### 2. BlogTranslationsContext - Новый контекст для переводов
**Файл:** `src/context/BlogTranslationsContext.tsx` (НОВЫЙ)

Создан контекст для передачи URL переводов между BlogPost и LocaleSwitcher:
```typescript
interface BlogTranslationsContextType {
  translations: Record<string, string>; // locale -> relative URL
  setTranslations: (translations: Record<string, string>) => void;
  clearTranslations: () => void;
}
```

**Интеграция в App.tsx:**
```typescript
<BlogTranslationsProvider>
  <Router>
    {/* routes */}
  </Router>
</BlogTranslationsProvider>
```

### 3. LocaleSwitcher - Умное переключение языков
**Файл:** `src/components/LocaleSwitcher.tsx`

**Добавлено:**
- Использует `useBlogTranslations()` для получения URL переводов
- При переключении языка на blog post → переходит на slug перевода
- Если перевода нет → переходит на `/{locale}/blog/`

```typescript
const handleLanguageChange = (langCode: string) => {
  // Если на странице blog post с переводами
  if (translations && Object.keys(translations).length > 0) {
    const translatedUrl = translations[langCode];

    if (translatedUrl) {
      // Переход на переведённый пост
      navigate(translatedUrl);
    } else {
      // Перевода нет → на список блога
      navigate(`/${langCode}/blog/`);
    }
    return;
  }

  // Стандартное поведение для других страниц
  // ...
}
```

### 4. Загрузка переводов в BlogPost
**Файл:** `src/pages/BlogPost.tsx`

```typescript
async function loadAlternateUrls(translationGroupId: string) {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, locale')
    .eq('translation_group_id', translationGroupId)
    .eq('published', true);

  if (data) {
    const alternates: Record<string, string> = {};      // Для hreflang
    const translationUrls: Record<string, string> = {}; // Для LocaleSwitcher

    data.forEach(translation => {
      alternates[translation.locale] = `${SITE_URL}/${translation.locale}/blog/${translation.slug}/`;
      translationUrls[translation.locale] = `/${translation.locale}/blog/${translation.slug}/`;
    });

    setAlternateUrls(alternates);  // → SEO component (hreflang)
    setTranslations(translationUrls); // → LocaleSwitcher (navigation)
  }
}
```

## Гарантии

### 1. Нет автоматических редиректов
- URL `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/` → загружает RU пост
- Если не найден → показывает 404
- НИ ОДНОГО `navigate()` в `useEffect` при загрузке

### 2. Нормализация локалей
- Везде используются только: `ru`, `en`, `cz`, `de`, `pl`
- Никаких `ru-RU`, `en-US`, `en-GB` в routing
- `SUPPORTED_LOCALES = ['en', 'de', 'pl', 'cz', 'ru']`

### 3. Правильное переключение языков
- LocaleSwitcher читает переводы из контекста
- Переключение EN→RU: `/en/blog/children-room-lighting-cri-color-rendering/` → `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`
- Переключение RU→EN: обратно на правильный EN slug

### 4. hreflang остаётся рабочим
- `alternateUrls` загружаются для SEO component
- Передаются в `<SEO alternateUrls={...} />`
- Генерируются `<link rel="alternate" hreflang="..." />`

## Проверка

### Автоматическая проверка
```bash
./scripts/check-blog-locale.sh
```

### Тестирование
```bash
npm run build
npm run preview
```

Открыть: `http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`

**Проверить:**
- ✅ Страница загружается без мигания
- ✅ URL не меняется автоматически
- ✅ Контент на русском языке
- ✅ Переключение на EN → правильный EN slug
- ✅ Переключение обратно на RU → правильный RU slug

### Проверка hreflang
```bash
curl -sL http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ | grep hreflang
```

Должно показать оба тега:
```html
<link rel="alternate" hreflang="ru" href="...ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/" />
<link rel="alternate" hreflang="en" href="...en/blog/children-room-lighting-cri-color-rendering/" />
```

## Файлы изменены

1. ✅ `src/pages/BlogPost.tsx` - убраны редиректы, добавлен context
2. ✅ `src/context/BlogTranslationsContext.tsx` - НОВЫЙ
3. ✅ `src/components/LocaleSwitcher.tsx` - умное переключение
4. ✅ `src/App.tsx` - интеграция BlogTranslationsProvider

## Файлы созданы

1. `scripts/check-blog-locale.sh` - автоматическая проверка
2. `scripts/test-blog-posts.sh` - тестирование через curl
3. `BLOG_TESTING_COMMANDS.md` - команды для ручной проверки
4. `BLOG_REDIRECT_FIX.md` - этот документ

## База данных

Проверены переводы в БД:
```
RU: osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi
EN: children-room-lighting-cri-color-rendering
translation_group_id: 414465aa-b3c2-4959-95e4-988930c90491
```

Оба опубликованы (`published = true`) и правильно связаны.

## Следующие шаги

1. Деплой на production
2. Проверка hreflang в Google Search Console
3. Мониторинг редиректов в логах
4. Проверка индексации RU страниц

---

**Статус:** ✅ HOTFIX COMPLETE
**Redirect loop:** ✅ УСТРАНЁН
**hreflang:** ✅ РАБОТАЕТ
**UX:** ✅ БЕЗ МИГАНИЯ
