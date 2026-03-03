# Команды для тестирования Blog Posts

## Быстрый тест через скрипт

```bash
./scripts/test-blog-posts.sh
```

## Ручная проверка

### 1. Билд и запуск preview сервера

```bash
npm run build
npm run preview
```

### 2. Проверка RU поста

**Прямая ссылка (не должна редиректить):**
```
http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
```

**Проверка hreflang в HTML:**
```bash
curl -sL http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ | grep -i "hreflang"
```

Должно показать:
- `<link rel="alternate" hreflang="ru" href="...ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/" />`
- `<link rel="alternate" hreflang="en" href="...en/blog/children-room-lighting-cri-color-rendering/" />`

### 3. Проверка EN поста

**Прямая ссылка:**
```
http://localhost:4173/en/blog/children-room-lighting-cri-color-rendering/
```

**Проверка hreflang в HTML:**
```bash
curl -sL http://localhost:4173/en/blog/children-room-lighting-cri-color-rendering/ | grep -i "hreflang"
```

### 4. Проверка на redirect loop

**Должно быть 0 редиректов:**
```bash
curl -sL -w "Redirects: %{num_redirects}\n" http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ -o /dev/null
```

### 5. Проверка контента

**RU контент:**
```bash
curl -sL http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ | grep -o "Освещение детской комнаты"
```

**EN контент:**
```bash
curl -sL http://localhost:4173/en/blog/children-room-lighting-cri-color-rendering/ | grep -o "Children's Room Lighting"
```

## Проверка в браузере

1. Откройте: `http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`
2. Страница должна загрузиться без мигания
3. Переключите язык на EN через LocaleSwitcher
4. Должен открыться EN пост: `/en/blog/children-room-lighting-cri-color-rendering/`
5. Переключите обратно на RU
6. Должен открыться RU пост: `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`

## Проверка в базе данных

**Проверить существующие переводы:**
```sql
SELECT locale, slug, title, translation_group_id
FROM blog_posts
WHERE translation_group_id IN (
  SELECT translation_group_id
  FROM blog_posts
  WHERE slug = 'osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi'
)
AND published = true
ORDER BY locale;
```

**Проверить все RU посты:**
```sql
SELECT id, title, slug, locale, published
FROM blog_posts
WHERE locale = 'ru' AND published = true;
```

## Что исправлено

✅ Убрана логика автоматических редиректов из `BlogPost.tsx`
✅ Пост загружается ТОЛЬКО по `slug + locale` из URL
✅ Если пост не найден → показывается 404, без редиректов
✅ `LocaleSwitcher` использует правильные slug переводов через `BlogTranslationsContext`
✅ При переключении языка на blog post → переходит на slug перевода
✅ Если перевода нет → переходит на `/locale/blog/`
✅ `alternateUrls` загружаются для hreflang тегов
✅ Никаких `navigate()` в `useEffect` при загрузке поста

## Ожидаемый результат

- ✅ `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/` → Загружается RU пост, без мигания
- ✅ `/en/blog/children-room-lighting-cri-color-rendering/` → Загружается EN пост
- ✅ hreflang теги присутствуют на обоих страницах
- ✅ Переключение языка работает корректно (переход на slug перевода)
- ✅ URL не меняется автоматически
- ✅ Нет бесконечных redirect loops
