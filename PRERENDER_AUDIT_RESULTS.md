# Prerender Audit Results - Фактические Доказательства

Дата: 2026-03-03
Время: после полного аудита build → prerender → dist files

---

## ✅ ПРОБЛЕМА НАЙДЕНА И ИСПРАВЛЕНА

### Первопричина
**prerender.mjs зависал на `networkidle2`** → файлы НЕ создавались → production отдаёт базовый SPA HTML без hreflang

### Исправление
```diff
- waitUntil: 'networkidle2',
- timeout: 90000
+ waitUntil: 'domcontentloaded',
+ timeout: 30000

+ // Wait for loading spinner to disappear
+ await page.waitForFunction(
+   () => !document.body.textContent.includes('Загрузка...') && !document.body.textContent.includes('Loading...'),
+   { timeout: 20000 }
+ );
```

**Файл:** `scripts/prerender.mjs:102-121`

---

## 📊 Результаты После Исправления

### Команда:
```bash
npm run build
node scripts/prerender-blog-only.mjs
```

### Выход:
```
✓ Saved: dist/en/blog/children-room-lighting-cri-color-rendering/index.html
  Canonical: YES
  Hreflang: 3 tags

✓ Saved: dist/en/blog/can-led-strip-replace-chandelier/index.html
  Canonical: YES
  Hreflang: 3 tags

✓ Saved: dist/ru/blog/zamena-lyustry-na-svetodiodnuyu-lentu/index.html
  Canonical: YES
  Hreflang: 3 tags

✓ Saved: dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html
  Canonical: YES
  Hreflang: 3 tags

📊 Summary:
✓ With hreflang: 4/4
```

---

## ⚠️ КРИТИЧЕСКАЯ ПРОБЛЕМА (остаётся)

### RU Blog Posts Загружают EN Контент

**Симптом:**
- dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html СУЩЕСТВУЕТ
- Файл имеет canonical и hreflang теги
- **НО**: canonical указывает на EN URL: `https://led-nabor.com/en/blog/children-room-lighting...`
- **И**: контент на английском: "How to Choose Safe Lighting for a Child's Room"

**Доказательство:**
```bash
$ grep 'rel="canonical"' dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html
<link rel="canonical" href="https://led-nabor.com/en/blog/children-room-lighting-cri-color-rendering/"

$ grep -o '<h2[^>]*>.*</h2>' dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html | head -1
<h2>How to Choose Safe Lighting for a Child's Room</h2>
```

**Причина:**
- Puppeteer открывает `/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/`
- LocaleWrapper/BlogPost загружает НЕПРАВИЛЬНЫЙ пост (EN вместо RU)
- Возможно: race condition между LocaleContext.setLocale() и BlogPost.loadPost()
- Или: navigator.language = 'en-US' в Puppeteer влияет на LanguageRedirect

**База данных КОРРЕКТНА:**
```sql
SELECT slug, locale, title, translation_group_id FROM blog_posts WHERE published = true;

| slug                                               | locale | translation_group_id                 |
|---------------------------------------------------|--------|--------------------------------------|
| children-room-lighting-cri-color-rendering        | en     | 414465aa-b3c2-4959-95e4-988930c90491 |
| osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi | ru     | 414465aa-b3c2-4959-95e4-988930c90491 |
```

**Требуется:**
1. Отладить почему BlogPost.tsx на RU URL загружает EN post
2. Проверить что locale parameter из useParams правильный при prerender
3. Возможно добавить console.log в BlogPost для отладки в puppeteer

---

## 🎯 Проверка Production

После деплоя на Netlify:

### 1. Проверить dist файлы созданы
```bash
# На Netlify build log должно быть:
✓ Prerendering completed: 79 routes

# Файлы должны существовать:
dist/en/blog/children-room-lighting-cri-color-rendering/index.html
dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html
```

### 2. Проверить view-source на production
```bash
curl -s https://led-nabor.com/en/blog/children-room-lighting-cri-color-rendering/ | grep 'hreflang='

# Должно вернуть:
hreflang="en"
hreflang="ru"
hreflang="x-default"
```

### 3. Проверить RU canonical
```bash
curl -s https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/ | grep 'rel="canonical"'

# Должно вернуть:
href="https://led-nabor.com/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/"

# НЕ:
href="https://led-nabor.com/en/blog/..."
```

---

## 📝 Исправленные Файлы

1. **scripts/prerender.mjs** - изменён waitUntil с networkidle2 на domcontentloaded
2. **scripts/prerender-blog-only.mjs** - создан для быстрого тестирования blog posts
3. **scripts/audit-dist-files.sh** - создан для проверки dist файлов

---

## 🚀 Next Steps

1. **Исправить RU blog posts контент** - отладить BlogPost.tsx loadPost()
2. **Запустить полный build:prerender** - проверить что НЕ зависает на всех 79 routes
3. **Deploy на Netlify** - проверить production
4. **Проверить Ctrl+F5 на RU URL** - не должно быть мигания/редиректов
