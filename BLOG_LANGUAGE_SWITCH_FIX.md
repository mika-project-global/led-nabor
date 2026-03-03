# BLOG REDIRECT LOOP & LANGUAGE SWITCHING - FINAL FIX

## Проблемы

1. ❌ Бесконечный redirect loop на blog posts: `/ru/blog/...` перекидывало между `/ru` ↔ `/en`
2. ❌ Переключатель языка менял `/ru/` на `/en/` с тем же slug → 404
3. ❌ Обновление RU страницы показывало "Статья не найдена"

## Решение

### Правильная загрузка поста (БЕЗ автоматических редиректов)

**BlogPost.tsx:** Загрузка ТОЛЬКО по `slug + locale` из URL, без navigate():

```typescript
async function loadPost() {
  console.log(`[BlogPost] Loading post: slug="${slug}", locale="${locale}"`);

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .maybeSingle();

  if (!data) {
    // 404 без редиректов
    setError(true);
    return;
  }

  setPost(data);
  await loadAlternateUrls(data.translation_group_id);
}
```

### Умное переключение языков через translation_group_id

**LocaleSwitcher.tsx:** Использует переводы из контекста:

```typescript
const handleLanguageChange = (langCode: string) => {
  const isBlogPost = pathSegments[1] === 'blog';

  if (isBlogPost && translations) {
    const translatedUrl = translations[langCode];
    if (translatedUrl) {
      navigate(translatedUrl); // Правильный slug
    } else {
      navigate(`/${langCode}/blog/`); // Нет перевода
    }
    return;
  }

  // Для других страниц: просто меняет locale в URL
}
```

## Гарантии

✅ Загрузка поста ТОЛЬКО по `slug + locale` из URL
✅ 404 если пост не найден (без редиректов)
✅ Переключение языка идёт на правильный slug через `translation_group_id`
✅ F5 не вызывает редиректы
✅ hreflang генерируется корректно
✅ Нет мигания страницы

## Тестирование

```bash
npm run build && npm run preview
```

Откройте с консолью (F12):
```
http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
```

**Проверьте:**
1. Логи загрузки поста
2. Логи загрузки переводов
3. Переключение RU → EN
4. Переключение EN → RU
5. F5 на обеих страницах

**См. также:**
- `BLOG_TRANSLATIONS_DEBUG.md` - подробный debug guide
- `scripts/test-blog-language-switch.sh` - мануальное тестирование

## База данных

Переводы связаны через `translation_group_id`:

```
RU: osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi
EN: children-room-lighting-cri-color-rendering
translation_group_id: 414465aa-b3c2-4959-95e4-988930c90491
```

## Итог

**Redirect loop:** ✅ УСТРАНЁН
**Language switching:** ✅ РАБОТАЕТ
**404 на RU:** ✅ ИСПРАВЛЕНО
**Debug logs:** ✅ ДОБАВЛЕНЫ
