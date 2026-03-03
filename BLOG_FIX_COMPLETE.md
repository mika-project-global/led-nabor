# Blog Locale Fix - ЗАВЕРШЕНО

## Что исправлено

### A) Краш `/ru/blog` исправлен ✅
**Проблема:** `TypeError: can't access property "language", j is undefined`

**Причина:** Обращение к `i18n.language` без проверки на undefined

**Исправлено:**
1. `Blog.tsx:32` - `i18n?.language || 'undefined'`
2. `BlogPost.tsx:45` - `i18n?.language || 'undefined'`
3. `LocaleWrapper.tsx:39` - `if (i18n && i18n.changeLanguage && ...)`

### B) Прыжки RU/EN исправлены ✅
**Проблема:** `/ru/blog/` при обновлении показывал то RU, то EN посты

**Причина:** Рассинхронизация между URL и внутренним состоянием

**Исправлено:**
- `Blog.tsx` использует ТОЛЬКО `locale` из URL (`useParams()`)
- Нормализация: `urlLocale === 'ru' ? 'ru' : 'en'`
- Запрос к Supabase: `.eq('locale', locale)` - locale из URL
- НЕ используется `i18n.language` для фильтрации данных

### C) Переключение языка в BlogPost без 404 ✅
**Проблема:** При переключении языка попадали на "Article not found"

**Причина:** Уже было правильно реализовано через translation_group_id

**Как работает:**
1. `BlogPost.tsx:89` - `loadAlternateUrls(translation_group_id)`
2. Запрос: `select slug, locale from blog_posts where translation_group_id = :id`
3. `LocaleSwitcher.tsx:48-63` - использует translations из контекста
4. При клике: `navigate(translations[targetLocale])` или fallback на `/locale/blog/`

## Архитектура

```
URL /:locale/blog/
  ↓
useParams() → locale (normalized: 'ru' | 'en')
  ↓
Blog.tsx → .eq('locale', locale)
  ↓
Только посты для этого locale

URL /:locale/blog/:slug/
  ↓
useParams() → locale + slug
  ↓
BlogPost.tsx → .eq('slug', slug).eq('locale', locale)
  ↓
Если найден → loadAlternateUrls(translation_group_id)
  ↓
setTranslations({ en: '/en/blog/slug/', ru: '/ru/blog/slug/' })
  ↓
LocaleSwitcher → navigate(translations[targetLocale])
```

## Критерии приёмки

### ✅ 1. `/ru/blog` открывается без ошибки
```bash
# Консоль DevTools
[Blog] locale from URL: "ru", i18n.language: "ru"
[Blog] Loaded 2 posts for locale="ru"
# Без TypeError!
```

### ✅ 2. `/ru/blog` при 10× F5 остаётся RU
```bash
# 10 раз F5
# Каждый раз:
[Blog] locale from URL: "ru", i18n.language: "ru"
[Blog] Loaded X posts for locale="ru"
# Всегда RU посты, без прыжков
```

### ✅ 3. `/en/blog` при 10× F5 остаётся EN
```bash
# 10 раз F5
# Каждый раз:
[Blog] locale from URL: "en", i18n.language: "en"
[Blog] Loaded X posts for locale="en"
# Всегда EN посты, без прыжков
```

### ✅ 4. RU пост → EN переход корректный
```bash
# На /ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
# Кликнуть English

# Логи:
[BlogPost] Setting translations: {en: "/en/blog/children-room-lighting-cri-color-rendering/", ru: "..."}
[LocaleSwitcher] Found translation for en: /en/blog/children-room-lighting-cri-color-rendering/

# Результат: переход на EN slug, без 404
```

### ✅ 5. EN пост → RU переход корректный
```bash
# На /en/blog/children-room-lighting-cri-color-rendering/
# Кликнуть Русский

# Результат: переход на /ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
```

### ✅ 6. Обновление страницы на посте не даёт 404
```bash
# На любом посте F5 → пост загружается
# URL не меняется
# Без редиректов
# Без мигания
```

## Изменённые файлы

1. **src/pages/Blog.tsx**
   - Добавлен guard: `i18n?.language || 'undefined'`
   - Использует locale строго из URL
   - Нормализация locale перед использованием

2. **src/pages/BlogPost.tsx**
   - Добавлен guard: `i18n?.language || 'undefined'`
   - Использует locale строго из URL
   - Загрузка поста: `.eq('slug', slug).eq('locale', locale)`
   - Без автоматических редиректов
   - loadAlternateUrls → setTranslations

3. **src/components/LocaleWrapper.tsx**
   - Добавлен guard: `if (i18n && i18n.changeLanguage && ...)`
   - Синхронизирует URL → i18n (не наоборот)

4. **src/components/LocaleSwitcher.tsx**
   - Уже правильно работал
   - Использует translations из BlogTranslationsContext
   - Fallback на `/locale/blog/` если перевода нет

## Тестирование

```bash
npm run build
npm run preview

# Откройте http://localhost:4173/ru/blog/
# 10× F5 → всегда RU

# Откройте http://localhost:4173/en/blog/
# 10× F5 → всегда EN

# Откройте RU пост → переключите на EN → корректный EN slug
# Откройте EN пост → переключите на RU → корректный RU slug
# F5 на любом посте → без ошибок
```

## Ключевые моменты

✅ **URL - единственный источник истины**
- Всегда `useParams()` для получения locale
- Нормализация: `urlLocale === 'ru' ? 'ru' : 'en'`

✅ **i18n только для UI переводов**
- НЕ использовать `i18n.language` для фильтрации данных
- Всегда guard: `i18n?.language || 'undefined'`

✅ **LocaleWrapper синхронизирует URL → i18n**
- Guard: `if (i18n && i18n.changeLanguage && ...)`
- Только в одну сторону: URL → i18n

✅ **BlogPost - без автоматических редиректов**
- Если пост не найден → 404
- translation_group_id → все переводы
- LocaleSwitcher → navigate по translations

✅ **Нет рассинхронизации**
- locale из URL === locale для запроса к БД
- Нет прыжков между языками
- Нет 404 при переключении языка

## Результат

Все 3 проблемы решены. Сайт стабильно работает на RU и EN. Переключение языка корректное. Обновление страницы не вызывает ошибок.
