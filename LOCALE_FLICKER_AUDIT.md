# Locale Flicker & Missing Hreflang - Root Cause Analysis

## Проблемы (из production):

1. **Flicker при Ctrl+F5**: При загрузке `/ru/blog/<slug>/` с Ctrl+F5 locale меняется несколько раз
2. **Отсутствие hreflang на RU blog posts**: EN посты имеют hreflang в view-source, RU - нет
3. **Кнопка "Вернуться к блогу"**: Иногда редиректит на homepage или переключает на EN

## Root Cause #1: LocaleWrapper useEffect Loop

### Код ДО исправления (СЛОМАННЫЙ):
```typescript
// src/components/LocaleWrapper.tsx:51
useEffect(() => {
  // ... locale sync logic
}, [locale, navigate, location.pathname, setLocale, i18n]);
//          ^^^^^^^^^^  ^^^^^^^^^^^^^^^^^  ^^^^^^^^^  ^^^
//          ВСЕ ЭТИ ЗАВИСИМОСТИ ВЫЗЫВАЛИ ЦИКЛЫ!
```

### Почему это вызывало flicker:

1. User visits `/ru/blog/post/`
2. LocaleWrapper mounts → useEffect запускается (locale changed)
3. Effect вызывает `i18n.changeLanguage('ru')` и `setLocale('ru')`
4. Один из этих вызовов может trigger re-render других компонентов
5. React Router обновляет location object (даже если URL не изменился)
6. `location.pathname` в dependencies → effect запускается СНОВА
7. **ЦИКЛ**: effect запускается несколько раз, видимое мигание

### Исправление:
```typescript
useEffect(() => {
  if (!locale) return;

  // Handle invalid locales once
  if (!SUPPORTED_LOCALES.includes(locale)) {
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate(newPath, { replace: true });
    }
    return;
  }

  // Sync i18n, context, DOM, localStorage
  if (i18n.language !== locale) i18n.changeLanguage(locale);
  setLocale(locale);
  if (document.documentElement.lang !== locale) {
    document.documentElement.lang = locale;
  }
  const saved = localStorage.getItem('preferredLocale');
  if (saved !== locale) localStorage.setItem('preferredLocale', locale);
}, [locale]); // ТОЛЬКО locale!
```

**Результат**: Effect запускается ТОЛЬКО когда `:locale` param действительно изменяется, нет циклов.

## Root Cause #2: BlogPost загружал alternateUrls ПОСЛЕ первого рендера

### Код ДО исправления (СЛОМАННЫЙ):
```typescript
// src/pages/BlogPost.tsx:88-92
setPost(data);  // <-- Рендер БЕЗ alternateUrls!

await incrementViews(data.id);
await loadRelatedPosts(data.id, data.locale);
await loadAlternateUrls(data.translation_group_id); // СЛИШКОМ ПОЗДНО!
```

**Проблема**:
- `setPost(data)` вызывает рендер компонента
- SEO component рендерится БЕЗ alternateUrls (еще не загружены)
- Prerender сохраняет HTML без hreflang тегов

### Исправление:
```typescript
// Load ALL data in parallel BEFORE setting state
const [relatedPostsData, alternatesData] = await Promise.all([
  // Load related posts
  supabase.from('blog_posts').select(...).then(result => result.data || []),

  // Load alternate URLs for hreflang
  supabase.from('blog_posts')
    .select('slug, locale')
    .eq('translation_group_id', data.translation_group_id)
    .then(result => {
      const alternates: Record<string, string> = {};
      (result.data || []).forEach(translation => {
        alternates[translation.locale] = `${SITE_URL}/${translation.locale}/blog/${translation.slug}/`;
      });
      return alternates;
    })
]);

// Increment views (fire and forget - don't block render)
incrementViews(data.id).catch(err => console.error(err));

// Set ALL state at once - SEO has alternateUrls on first render!
setPost(data);
setRelatedPosts(relatedPostsData);
setAlternateUrls(alternatesData);
```

**Результат**: SEO component имеет alternateUrls на ПЕРВОМ рендере → prerender сохраняет hreflang.

## Root Cause #3: Prerender Timeout на RU Posts

Prerender застревал при обработке RU blog posts (timeout после 10 минут).

**Возможные причины**:
- Wait time слишком короткий (2.5s) для полной загрузки данных
- RU posts имеют больше контента
- Network issues с базой данных

**Исправление**:
- Увеличен wait time до 5s
- BlogPost теперь загружает все данные параллельно (быстрее)

## Проверка исправлений

### ✅ EN Blog Post (РАБОТАЕТ):
```bash
$ ls dist/en/blog/children-room-lighting-cri-color-rendering/
index.html

$ grep 'rel="alternate"' dist/en/blog/children-room-lighting-cri-color-rendering/index.html
<link rel="alternate" hreflang="en" href="https://led-nabor.com/en/blog/children-room-lighting-cri-color-rendering/">
<link rel="alternate" hreflang="ru" href="https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/">
<link rel="alternate" hreflang="x-default" href="https://led-nabor.com/en/blog/children-room-lighting-cri-color-rendering/">
```

### ❌ RU Blog Posts (НЕ PRERENDERED):
```bash
$ ls dist/ru/blog/
index.html  # <-- Только главная страница блога, нет конкретных постов!
```

## Следующие шаги

1. **Запустить prerender с увеличенным timeout**: Убедиться что RU посты генерируются
2. **Проверить dist файлы**: Убедиться что все blog posts имеют hreflang
3. **Deploy и тестирование**: Проверить view-source на production для RU постов
4. **Flicker тест**: Ctrl+F5 на `/ru/blog/<slug>/` должен остаться на RU

## Файлы изменённые:

1. **src/components/LocaleWrapper.tsx** - Исправлены useEffect dependencies → только [locale]
2. **src/pages/BlogPost.tsx** - Параллельная загрузка alternates перед рендером
3. **scripts/prerender.mjs** - Увеличен wait time до 5s
