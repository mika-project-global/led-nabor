# Locale Flicker & Missing Hreflang - СТАТУС ИСПРАВЛЕНИЯ

Дата: 2026-03-03

## ✅ Выполнено

### 1. LocaleWrapper - Исправлен useEffect Loop
**Файл**: `src/components/LocaleWrapper.tsx`

**Проблема**: useEffect имел зависимости `[locale, navigate, location.pathname, setLocale, i18n]` что вызывало бесконечные циклы и видимое мигание

**Исправлено**:
- useEffect теперь зависит ТОЛЬКО от `[locale]`
- Добавлен `useRef` для предотвращения повторных редиректов
- Удалены все нестабильные зависимости

**Результат**: Нет циклов, нет мигания при Ctrl+F5

### 2. BlogPost - Параллельная загрузка alternateUrls
**Файл**: `src/pages/BlogPost.tsx`

**Проблема**: `setPost(data)` вызывался ДО загрузки alternateUrls, prerender сохранял HTML без hreflang

**Исправлено**:
- Используется `Promise.all()` для параллельной загрузки related posts и alternates
- ВСЕ данные загружаются ПЕРЕД `setPost()`
- `incrementViews()` fire-and-forget (не блокирует render)

**Результат**: SEO component имеет alternateUrls на ПЕРВОМ рендере

### 3. Prerender - Увеличен Wait Time
**Файл**: `scripts/prerender.mjs`

**Изменение**: Wait time увеличен с 2.5s до 5s для полной загрузки данных

### 4. Кнопка "Back to Blog"
**Проверено**: ✅ Уже корректна - использует `/${locale}/blog/` во всех местах

### 5. База данных
**Проверено**: ✅ Translation groups правильные:
- Группа 1: EN children-room-lighting + RU osveshchenie-detskoy
- Группа 2: EN can-led-strip-replace-chandelier + RU zamena-lyustry

### 6. Документация
**Создано**:
- `LOCALE_FLICKER_AUDIT.md` - root cause analysis
- `LOCALE_FIX_SUMMARY.md` - детальная документация исправлений
- `STATUS.md` - этот файл

## ⚠️ Известные проблемы

### 1. Prerender Timeout
**Симптом**: `npm run build:prerender` зависает после 10 минут

**Текущий статус**:
- Build успешен
- Prerender начинается но не завершается
- RU blog posts не генерируются

**Возможные причины**:
- Puppeteer зависает на RU страницах
- Network timeout к Supabase
- Слишком большой wait time (5s)

**Временное решение**: Manual prerendering с уменьшенным wait time или отдельный prerender для blog posts

### 2. Test Script Overwrite
**Симптом**: Тестовый скрипт `test-blog-prerender.mjs` перезаписывал файлы 404 страницами

**Причина**: serve-handler возвращал directory listing вместо index.html

**Решение**: НЕ ИСПОЛЬЗОВАТЬ test-blog-prerender.mjs, использовать только оригинальный prerender.mjs

## 📋 Следующие шаги

### Немедленно:

1. **Отладка Prerender Timeout**:
   ```bash
   # Попробовать с меньшим wait time
   # Или запустить только для blog posts
   # Или использовать parallel prerendering
   ```

2. **После успешного prerender**:
   ```bash
   # Проверить файлы созданы
   ls dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/

   # Проверить hreflang в файлах
   grep 'rel="alternate"' dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html
   ```

3. **Deploy и тестирование**:
   - Deploy dist/ на production
   - Проверить view-source на RU blog posts
   - Тест Ctrl+F5 на `/ru/blog/<slug>/`
   - Тест language switcher
   - Тест "Back to Blog"

### После deploy:

4. **Verification Checklist**:
   - [ ] `view-source:` RU blog post имеет hreflang (en, ru, x-default)
   - [ ] `view-source:` EN blog post имеет hreflang (en, ru, x-default)
   - [ ] Ctrl+F5 на `/ru/blog/<slug>/` → нет мигания
   - [ ] Language switcher → одна навигация
   - [ ] "Back to Blog" → сохраняет locale

## 🔍 Проверка исправлений (Dev Mode)

```bash
# 1. Start dev server
npm run dev

# 2. Открыть в браузере с dev tools:
http://localhost:5173/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/

# 3. Network tab: проверить количество navigation events
# Должно быть: 1 navigation (initial load)
# Не должно быть: multiple redirects/reloads

# 4. Ctrl+F5 (hard refresh)
# Должно: остаться на RU
# Не должно: переключиться на EN или мигать

# 5. Language switcher EN → RU → EN
# Каждое переключение: ровно 1 navigation
```

## 🐛 Troubleshooting Guide

### Проблема: Prerender зависает

**Диагностика**:
```bash
# Проверить подключение к Supabase
node -e "import('@supabase/supabase-js').then(m => {
  const c = m.createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  c.from('blog_posts').select('slug').then(d => console.log('OK:', d.data.length));
})"
```

**Решения**:
1. Уменьшить wait time обратно до 2.5s
2. Добавить timeout для каждой страницы (не весь процесс)
3. Skip blog posts в prerender (prerender их вручную позже)

### Проблема: RU posts всё ещё без hreflang после deploy

**Диагностика**:
```bash
# Проверить файл существует локально
ls dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html

# Проверить содержит hreflang
grep -c 'rel="alternate"' dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html
# Должно вывести: 3 (или количество переводов)
```

**Решения**:
1. Если файл НЕ существует: prerender не завершился → решить prerender timeout
2. Если файл существует но без hreflang: BlogPost.tsx не загружает alternates → проверить код
3. Если локально есть hreflang но на production нет: проблема с deploy/CDN → check netlify rewrites

### Проблема: Мигание всё ещё видно

**Диагностика**:
```bash
# Проверить LocaleWrapper dependencies
grep -A 2 "}, \[" src/components/LocaleWrapper.tsx
# Должно показать: }, [locale]);
```

**Решения**:
1. Если там другие dependencies: linter откатил изменения → исправить снова
2. Проверить консоль браузера на ошибки
3. Проверить другие компоненты на `navigate()` в mount

## 📊 Метрики успеха

После завершения ВСЕХ исправлений:

**Code**:
- ✅ LocaleWrapper useEffect: `}, [locale]);`
- ✅ BlogPost: `Promise.all([relatedPosts, alternates])`
- ✅ Prerender: wait time 5s

**Files**:
- ⏳ dist/en/blog/can-led-strip-replace-chandelier/index.html
- ⏳ dist/en/blog/children-room-lighting-cri-color-rendering/index.html
- ⏳ dist/ru/blog/osveshchenie-detskoy-komnaty-indeks-tsvetoperedachi/index.html
- ⏳ dist/ru/blog/zamena-lyustry-na-svetodiodnuyu-lentu/index.html

**Each file должен содержать**:
- Canonical link
- Hreflang links (en, ru, x-default минимум)
- Полный blog post контент

**Production**:
- ⏳ view-source: hreflang на RU posts
- ⏳ Ctrl+F5: нет мигания
- ⏳ Language switcher: одна навигация
- ⏳ Back to Blog: сохраняет locale

## 🎯 Приоритет задач

1. **HIGH**: Решить prerender timeout (блокирует deploy)
2. **MEDIUM**: Verify hreflang в dist файлах
3. **LOW**: Production testing после deploy

## 📝 Заметки для deployment

После успешного prerender:
```bash
# Verify all blog posts generated
find dist -name "*.html" -path "*/blog/*" ! -name "index.html" | wc -l
# Должно быть: 4 (2 EN + 2 RU)

# Verify hreflang in each
for f in dist/*/blog/*/index.html; do
  count=$(grep -c 'rel="alternate"' "$f")
  echo "$f: $count hreflang tags"
done

# All should show: 3 or more hreflang tags
```

## Контакты / Help

Если нужна помощь:
1. Проверьте `LOCALE_FLICKER_AUDIT.md` для root cause analysis
2. Проверьте `LOCALE_FIX_SUMMARY.md` для детальной документации
3. Проверьте этот `STATUS.md` для текущего статуса
