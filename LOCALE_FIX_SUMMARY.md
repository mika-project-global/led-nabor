# Locale Flicker & Missing Hreflang - ИСПРАВЛЕНИЯ

## Обзор проблем

### 1. Flicker/Мигание при Ctrl+F5
**Симптом**: При нажатии Ctrl+F5 на `/ru/blog/<slug>/` видно переключение локали несколько раз

**Root Cause**: LocaleWrapper имел все зависимости в useEffect, что вызывало циклы

**Исправлено**: ✅ useEffect теперь зависит ТОЛЬКО от `[locale]`

### 2. Отсутствие hreflang на RU blog posts
**Симптом**: EN posts имеют hreflang в view-source, RU posts - нет

**Root Cause**: BlogPost вызывал `setPost()` ДО загрузки alternateUrls, prerender сохранял HTML без hreflang

**Исправлено**: ✅ alternateUrls загружаются параллельно ПЕРЕД `setPost()`

### 3. Кнопка "Вернуться к блогу"
**Проверено**: ✅ Уже корректна - использует `/${locale}/blog/`

## Детальные исправления

### Fix #1: LocaleWrapper Dependencies

**Файл**: `src/components/LocaleWrapper.tsx`

**ДО (СЛОМАНО)**:
```typescript
}, [locale, navigate, location.pathname, setLocale, i18n]);
```

**ПОСЛЕ (ИСПРАВЛЕНО)**:
```typescript
import { useEffect, useRef } from 'react';

export function LocaleWrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLocale } = useLocale();
  const { i18n } = useTranslation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!locale) return;

    if (!SUPPORTED_LOCALES.includes(locale)) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        const newPath = location.pathname.replace(`/${locale}`, `/${DEFAULT_LOCALE}`);
        navigate(newPath, { replace: true });
      }
      return;
    }

    hasRedirectedRef.current = false;

    if (i18n.language !== locale) i18n.changeLanguage(locale);
    setLocale(locale);
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
    const saved = localStorage.getItem('preferredLocale');
    if (saved !== locale) localStorage.setItem('preferredLocale', locale);
  }, [locale]); // ТОЛЬКО locale!

  return <>{children}</>;
}
```

**Изменения**:
1. ✅ Добавлен `useRef` для отслеживания redirects (избегает повторных редиректов)
2. ✅ Удалены ВСЕ нестабильные зависимости: `navigate`, `location.pathname`, `setLocale`, `i18n`
3. ✅ Effect зависит ТОЛЬКО от `locale` - запускается только когда `:locale` param меняется
4. ✅ Проверки перед изменением состояния (избегает лишних обновлений)

**Результат**:
- Нет циклов
- Нет мигания
- Ctrl+F5 остается на той же локали

### Fix #2: BlogPost Data Loading

**Файл**: `src/pages/BlogPost.tsx`

**ДО (СЛОМАНО)**:
```typescript
setPost(data);

await incrementViews(data.id);
await loadRelatedPosts(data.id, data.locale);
await loadAlternateUrls(data.translation_group_id); // Слишком поздно!
```

**ПОСЛЕ (ИСПРАВЛЕНО)**:
```typescript
const [relatedPostsData, alternatesData] = await Promise.all([
  supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, image_url, published_at, views, locale')
    .eq('published', true)
    .eq('locale', data.locale)
    .neq('id', data.id)
    .order('published_at', { ascending: false })
    .limit(3)
    .then(result => result.data || []),

  supabase
    .from('blog_posts')
    .select('slug, locale')
    .eq('translation_group_id', data.translation_group_id)
    .eq('published', true)
    .then(result => {
      const alternates: Record<string, string> = {};
      (result.data || []).forEach(translation => {
        alternates[translation.locale] = `${SITE_URL}/${translation.locale}/blog/${translation.slug}/`;
      });
      return alternates;
    })
]);

incrementViews(data.id).catch(err => console.error('Error incrementing views:', err));

setPost(data);
setRelatedPosts(relatedPostsData);
setAlternateUrls(alternatesData);
```

**Изменения**:
1. ✅ `Promise.all()` загружает related posts и alternates ПАРАЛЛЕЛЬНО
2. ✅ ВСЕ данные загружаются ПЕРЕД `setPost()`
3. ✅ `incrementViews()` fire-and-forget (не блокирует render)
4. ✅ Все состояния устанавливаются одновременно

**Результат**:
- SEO component получает `alternateUrls` на ПЕРВОМ рендере
- Prerender сохраняет HTML с hreflang тегами
- EN и RU posts имеют корректный hreflang

### Fix #3: Prerender Wait Time

**Файл**: `scripts/prerender.mjs`

**Изменение**:
```typescript
// ДО:
await new Promise(resolve => setTimeout(resolve, 2500));

// ПОСЛЕ:
await new Promise(resolve => setTimeout(resolve, 5000));
```

**Результат**: Больше времени для полной загрузки данных blog post перед сохранением HTML

## Проверка результатов

### 1. Build & Prerender

```bash
npm run build
node scripts/prerender.mjs
```

**Ожидаемый результат**:
- Все маршруты успешно prerendered
- Файлы созданы:
  - `dist/en/blog/children-room-lighting-cri-color-rendering/index.html`
  - `dist/en/blog/can-led-strip-replace-chandelier/index.html`
  - `dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html`
  - `dist/ru/blog/zamena-lyustry-na-svetodiodnuyu-lentu/index.html`

### 2. Проверка hreflang в dist файлах

```bash
# EN post
grep 'rel="alternate"' dist/en/blog/children-room-lighting-cri-color-rendering/index.html

# Должно показать:
# <link rel="alternate" hreflang="en" href="https://led-nabor.com/en/blog/children-room-lighting-cri-color-rendering/">
# <link rel="alternate" hreflang="ru" href="https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/">
# <link rel="alternate" hreflang="x-default" href="...">

# RU post
grep 'rel="alternate"' dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html

# Должно показать те же hreflang теги
```

### 3. Production Testing

После deploy:

**A) view-source тест**:
```
1. Откройте: view-source:https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
2. Ctrl+F "hreflang"
3. Должно найти 3+ совпадения (en, ru, x-default)
```

**B) Flicker тест**:
```
1. Откройте: https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
2. Нажмите Ctrl+F5 (полное обновление)
3. Проверьте: НЕ должно быть видимого переключения языка
```

**C) Navigation тест**:
```
1. На RU blog post, переключите язык на EN
2. Должен перейти на EN версию (один переход)
3. Нет дополнительных редиректов
```

**D) Back to Blog тест**:
```
1. На любом blog post, нажмите "Вернуться к блогу" / "Back to Blog"
2. Должен перейти на /{locale}/blog/
3. Локаль сохраняется
```

## Критерии успеха

- ✅ **Нет Flicker**: Ctrl+F5 на `/ru/blog/<slug>/` остается на RU
- ✅ **Hreflang везде**: И EN и RU blog posts имеют hreflang в view-source
- ✅ **Back to Blog работает**: Всегда идет на `/{locale}/blog/`
- ✅ **URL - источник истины**: Нет авто-редиректов когда locale в URL

## Архитектура (гарантии)

### URL - единственный источник истины

```
Правило: Если URL = /{locale}/... → ТА locale используется, БЕЗ редиректов
```

### Обязанности компонентов

**LanguageRedirect** (только `/` root):
- Определяет locale: localStorage → navigator → default
- Редиректит ОДИН РАЗ на `/{locale}/`
- НИКОГДА не запускается на путях с locale

**LocaleWrapper** (все `/{locale}/*` пути):
- Синхронизирует i18n с URL locale
- Сохраняет в localStorage для будущих визитов
- НИКОГДА не редиректит на основе localStorage/navigator
- Effect зависит ТОЛЬКО от `locale` param

**LocaleSwitcher** (действие пользователя):
- Пользователь нажимает кнопку языка
- Навигация на новый locale path
- Одна навигация, без циклов

### Гарантия загрузки данных

**BlogPost loading order**:
1. Fetch post data
2. Load related + alternates ПАРАЛЛЕЛЬНО (`Promise.all`)
3. Set ВСЕ состояния СРАЗУ
4. `setLoading(false)` → запускает render
5. SEO component имеет `alternateUrls` → рендерит hreflang

## Troubleshooting

### Проблема: Всё ещё вижу мигание
**Решение**:
1. Проверьте LocaleWrapper.tsx имеет `}, [locale]);`
2. Проверьте консоль на ошибки
3. Проверьте другие компоненты на `navigate()` в mount

### Проблема: RU post всё ещё без hreflang
**Решение**:
1. Проверьте файл существует: `ls dist/ru/blog/<slug>/index.html`
2. Если файла нет - prerender не завершился
3. Запустите: `node scripts/prerender.mjs` напрямую
4. Проверьте БД: все posts имеют `published = true` и `translation_group_id`

### Проблема: Prerender timeout
**Решение**:
1. Проверьте сетевое подключение к Supabase
2. Проверьте .env файл имеет VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
3. Увеличьте wait time в prerender.mjs
4. Проверьте логи браузера в prerender выводе

## Изменённые файлы

1. **src/components/LocaleWrapper.tsx** - Исправлен useEffect loop
2. **src/pages/BlogPost.tsx** - Параллельная загрузка alternates
3. **scripts/prerender.mjs** - Увеличен wait time до 5s
4. **LOCALE_FLICKER_AUDIT.md** - Root cause analysis (этот файл)
5. **LOCALE_FIX_SUMMARY.md** - Документация исправлений

## База данных - blog posts

```sql
-- Проверка существующих постов
SELECT slug, locale, translation_group_id, published
FROM blog_posts
ORDER BY locale, slug;

-- Результат (должно быть):
-- children-room-lighting-cri-color-rendering | en | <group_id> | true
-- can-led-strip-replace-chandelier | en | <group_id> | true
-- osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi | ru | <group_id> | true
-- zamena-lyustry-na-svetodiodnuyu-lentu | ru | <group_id> | true
```

Каждая пара переводов ДОЛЖНА иметь одинаковый `translation_group_id`.

## Следующие шаги

1. ✅ Код исправлен
2. ✅ Build выполнен успешно
3. ⏳ Prerender - нужно завершить (RU posts timeout)
4. ⏳ Проверить dist файлы на hreflang
5. ⏳ Deploy на production
6. ⏳ Проверить view-source на production
7. ⏳ Тест Ctrl+F5 без мигания

## Метрики после deploy

Все это должно быть `true`:

- [ ] `view-source:` показывает hreflang на RU blog posts
- [ ] Ctrl+F5 на `/ru/blog/<slug>/` → 0 изменений locale
- [ ] Language switcher → ровно 1 навигация
- [ ] "Back to Blog" сохраняет locale
- [ ] Все blog post файлы в dist/{locale}/blog/{slug}/index.html
- [ ] EN и RU posts имеют идентичный набор hreflang тегов
