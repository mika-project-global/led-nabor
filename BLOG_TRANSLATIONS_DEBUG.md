# Blog Translations - Debugging Guide

## Что исправлено

### 1. LocaleSwitcher с отладкой
**Файл:** `src/components/LocaleSwitcher.tsx`

Добавлены console.log для отладки:
- Определение blog post страницы
- Проверка наличия translations в контексте
- Логирование найденных переводов
- Переход на правильный slug

### 2. BlogPost с отладкой
**Файл:** `src/pages/BlogPost.tsx`

Добавлены console.log:
- Загрузка поста (slug + locale)
- Успех/неудача загрузки
- Загрузка translations из translation_group_id
- Установка translations в контекст

### 3. BlogTranslationsContext
**Файл:** `src/context/BlogTranslationsContext.tsx`

Контекст для передачи URL переводов между BlogPost и LocaleSwitcher.

## Тестирование

### 1. Запуск с console.log

```bash
npm run build
npm run preview
```

Откройте в браузере с открытой консолью (F12):

```
http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
```

### 2. Проверка логов при загрузке RU поста

Вы должны увидеть в консоли:

```
[BlogPost] Loading post: slug="osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi", locale="ru"
[BlogPost] Post loaded successfully: Освещение детской комнаты: почему индекс цветопередачи важнее яркости
[BlogPost] Loading translations for group: 414465aa-b3c2-4959-95e4-988930c90491
[BlogPost] Found translations: Array(2) [
  {slug: "children-room-lighting-cri-color-rendering", locale: "en"},
  {slug: "osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi", locale: "ru"}
]
[BlogPost] Setting translations: {
  en: "/en/blog/children-room-lighting-cri-color-rendering/",
  ru: "/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/"
}
```

### 3. Проверка переключения языка

Кликните на переключатель языка и выберите "English":

```
[LocaleSwitcher] Blog post detected, translations: {
  en: "/en/blog/children-room-lighting-cri-color-rendering/",
  ru: "/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/"
}
[LocaleSwitcher] Found translation for en: /en/blog/children-room-lighting-cri-color-rendering/
```

После этого должен произойти переход на EN пост.

### 4. Проверка обратного переключения

На EN посте переключитесь обратно на "Русский":

```
[LocaleSwitcher] Blog post detected, translations: {
  en: "/en/blog/children-room-lighting-cri-color-rendering/",
  ru: "/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/"
}
[LocaleSwitcher] Found translation for ru: /ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/
```

### 5. Проверка обновления страницы

**На RU странице:**
- Нажмите F5 (обновить)
- Должен показать RU пост без редиректов
- URL не должен меняться

**На EN странице:**
- Нажмите F5
- Должен показать EN пост без редиректов
- URL не должен меняться

## Проблемы и решения

### Проблема: translations пустой в LocaleSwitcher

**Симптомы:**
```
[LocaleSwitcher] Default behavior: /ru/blog/... → /en/blog/...
```

**Причины:**
1. BlogPost не загрузил переводы
2. translation_group_id не найден
3. Контекст не передаёт данные

**Решение:**
- Проверьте логи `[BlogPost] Setting translations:`
- Убедитесь что translation_group_id существует в БД
- Проверьте что BlogTranslationsProvider обёрнут вокруг Router в App.tsx

### Проблема: 404 при переключении языка

**Симптомы:**
- Переключение RU→EN показывает "Статья не найдена"

**Причины:**
1. Перевод не опубликован (published = false)
2. Неправильный slug в БД
3. translation_group_id не совпадает

**Решение:**
```sql
-- Проверить переводы
SELECT locale, slug, title, published, translation_group_id
FROM blog_posts
WHERE translation_group_id = (
  SELECT translation_group_id
  FROM blog_posts
  WHERE slug = 'osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi'
);
```

### Проблема: Redirect loop

**Симптомы:**
- Страница мигает и переключается между локалями

**Причины:**
1. navigate() в useEffect без условия
2. Автоматический редирект при загрузке

**Решение:**
- В BlogPost НЕТ navigate() в loadPost
- Только показывается 404 если пост не найден
- navigate() ТОЛЬКО при клике пользователя в LocaleSwitcher

## Проверка в базе данных

```sql
-- Проверить все посты с переводами
SELECT
  bp1.locale AS locale1,
  bp1.slug AS slug1,
  bp1.title AS title1,
  bp2.locale AS locale2,
  bp2.slug AS slug2,
  bp2.title AS title2,
  bp1.translation_group_id
FROM blog_posts bp1
JOIN blog_posts bp2 ON bp1.translation_group_id = bp2.translation_group_id
WHERE bp1.locale = 'ru' AND bp2.locale = 'en'
  AND bp1.published = true AND bp2.published = true
ORDER BY bp1.created_at DESC;
```

Ожидаемый результат:
```
locale1 | slug1                                              | title1                       | locale2 | slug2                                    | title2                         | translation_group_id
--------|----------------------------------------------------|-----------------------------|---------|------------------------------------------|--------------------------------|---------------------
ru      | osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi| Освещение детской комнаты...| en      | children-room-lighting-cri-color-rendering| Children's Room Lighting...   | 414465aa-...
```

## Финальная проверка

### Чек-лист:

- [ ] RU пост загружается без редиректов
- [ ] EN пост загружается без редиректов
- [ ] Переключение RU→EN идёт на правильный slug
- [ ] Переключение EN→RU идёт на правильный slug
- [ ] Обновление страницы не вызывает редиректы
- [ ] hreflang теги присутствуют на обоих языках
- [ ] Console.log показывает правильные translations
- [ ] Нет бесконечных redirect loops

### Команды для быстрой проверки:

```bash
# Проверка RU контента
curl -sL http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ | grep -o "Освещение детской комнаты"

# Проверка EN контента
curl -sL http://localhost:4173/en/blog/children-room-lighting-cri-color-rendering/ | grep -o "Children's Room Lighting"

# Проверка hreflang на RU странице
curl -sL http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ | grep hreflang

# Проверка отсутствия редиректов
curl -sL -w "Redirects: %{num_redirects}\n" http://localhost:4173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ -o /dev/null
```

## Удаление отладочных логов

После успешного тестирования удалите console.log:

```bash
# Найти все console.log в blog-related файлах
grep -n "console.log" src/pages/BlogPost.tsx src/components/LocaleSwitcher.tsx
```

Замените на комментарии или удалите после подтверждения работы.

---

**Статус:** ✅ Debug logs добавлены
**Готово к тестированию:** ✅ ДА
