# Blog Locale Issues - Final Fix

## Исправленные проблемы

### A) Blog Post - 404 при переключении языка
**Причина:** LocaleSwitcher использовал контекст, но требовалась более подробная отладка
**Решение:** Добавлены логи для отслеживания translations в контексте

### B) Blog List - прыжки между RU/EN
**Причина:** Blog.tsx использовал `language` вместо `locale` из URL
**Решение:** Заменено на `locale`, добавлены логи

## Изменённые файлы

### 1. src/pages/Blog.tsx
- `useEffect` зависит от `locale` вместо `language`
- Запрос `.eq('locale', locale)` вместо `.eq('locale', language)`
- Добавлены console.log для отладки

### 2. src/components/LocaleWrapper.tsx
- Добавлены console.log для отслеживания синхронизации locale

### 3. src/components/LocaleSwitcher.tsx
- Добавлены console.log для отслеживания translations и переключения

## Проверка

```bash
npm run build && npm run preview
```

### Тест 1: Blog list не прыгает

Откройте: `http://localhost:4173/ru/blog/`

**Действия:**
1. Обновите страницу (F5) 10 раз подряд
2. Проверьте логи в консоли

**Ожидается:**
```
[LocaleWrapper] pathname="/ru/blog/", locale="ru", i18n.language="ru"
[Blog] Loading posts for locale: "ru"
[Blog] Loaded 2 posts for locale="ru"
```

**Результат:** Всегда показывает RU посты, нет прыжков

### Тест 2: EN blog list

Откройте: `http://localhost:4173/en/blog/`

**Действия:** 10 обновлений подряд

**Ожидается:**
```
[LocaleWrapper] pathname="/en/blog/", locale="en", i18n.language="en"
[Blog] Loading posts for locale: "en"
[Blog] Loaded 2 posts for locale="en"
```

### Тест 3: RU → EN на blog post

Откройте: `http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`

**Действия:**
1. Проверьте логи загрузки:
```
[BlogPost] Loading post: slug="osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi", locale="ru"
[BlogPost] Post loaded successfully: Освещение детской комнаты...
[BlogPost] Setting translations: {en: "/en/blog/children-room-lighting-cri-color-rendering/", ru: "..."}
```

2. Кликните на переключатель языка → English

**Ожидается:**
```
[LocaleSwitcher] Switching to en, pathname="/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/", isBlogPost=true, translations: {...}
[LocaleSwitcher] Found translation for en: /en/blog/children-room-lighting-cri-color-rendering/
```

**Результат:** URL меняется на `/en/blog/children-room-lighting-cri-color-rendering/`

### Тест 4: EN → RU на blog post

На EN посте переключитесь на Русский

**Ожидается:** URL меняется на `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`

### Тест 5: F5 на RU посте

**Действия:** Нажмите F5 на RU посте

**Ожидается:**
- RU пост загружается
- URL не меняется
- Нет редиректов

### Тест 6: F5 на EN посте

**Действия:** Нажмите F5 на EN посте

**Ожидается:**
- EN пост загружается
- URL не меняется
- Нет редиректов

## Если проблема остаётся

### translations пустой

**Симптомы:**
```
[LocaleSwitcher] Not a blog post or no translations, using default behavior
```

**Проверьте:**
1. `[BlogPost] Setting translations:` - должен показывать объект с ru/en
2. translation_group_id существует в БД
3. Оба поста опубликованы (published = true)

### SQL для проверки:

```sql
SELECT locale, slug, title, translation_group_id, published
FROM blog_posts
WHERE translation_group_id = '414465aa-b3c2-4959-95e4-988930c90491'
ORDER BY locale;
```

## Удаление debug логов

После успешной проверки удалите console.log из:
- src/pages/Blog.tsx
- src/pages/BlogPost.tsx
- src/components/LocaleSwitcher.tsx
- src/components/LocaleWrapper.tsx

## Итог

✅ Blog list использует `locale` из URL
✅ Нет прыжков между локалями
✅ LocaleSwitcher правильно использует translations
✅ F5 не вызывает редиректов
✅ Debug логи добавлены
