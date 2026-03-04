# Production Deploy Checklist - Sitemap Fix

## ❌ Текущая ситуация
- **Продакшен:** 36 URL (старый sitemap без блог-постов)
- **Локально:** 88 URL (правильный sitemap с блог-постами)

## ✅ Что исправлено локально

1. ✅ Скрипт генерации с детальными логами
2. ✅ Проверка переменных окружения
3. ✅ Fail-fast при ошибках
4. ✅ Команда `npm run sitemap:check`
5. ✅ Автоматическое копирование в dist/

## 🚀 Что нужно сделать на продакшене

### 1. Установить переменные окружения

В настройках вашего хостинга добавьте:

```
VITE_SUPABASE_URL = https://aahexteequomvfvlvkal.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaGV4dGVlcXVvbXZmdmx2a2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzM2MTAsImV4cCI6MjA1NzkwOTYxMH0.33f7-EKjei41TcIcOUOWVgcCZDa1ooEZ6TxWN4-Qrsk
```

### 2. Изменить команду сборки

Старая команда: `npm run build`
Новая команда: `npm run build:production`

### 3. Удалить старый sitemap (опционально)

Если продакшен использует закешированный файл:

```bash
git rm public/sitemap.xml
git commit -m "Remove old sitemap"
git push
```

### 4. Задеплоить изменения

```bash
git add .
git commit -m "Fix sitemap generation for production"
git push
```

Или через UI: **Trigger Deploy / Redeploy**

## 📋 Чеклист проверки

После деплоя проверьте:

- [ ] В логах build видно: `✓ Found 52 published blog posts`
- [ ] В логах build видно: `📊 Total URLs: 88`
- [ ] `curl https://led-nabor.com/sitemap.xml | grep -c '<url>'` выводит 88
- [ ] `curl https://led-nabor.com/sitemap.xml | grep '/blog/'` показывает статьи
- [ ] В браузере https://led-nabor.com/sitemap.xml содержит blog URLs

## 🔍 Где проверить настройки

### Netlify
1. Site Settings → Environment Variables
2. Site Settings → Build & Deploy → Build command

### Vercel  
1. Project Settings → Environment Variables
2. Project Settings → General → Build Command

### Other Hosting
Найдите раздел Environment Variables и Build Settings

## ⚠️ Если что-то пошло не так

### Build падает с ошибкой
**Хорошо!** Это означает что скрипт работает правильно и обнаружил проблему.

Проверьте:
- Переменные окружения установлены
- Ключи полные (не обрезаны)
- Используется `npm run build:production`

### Build проходит, но sitemap не обновился
- Проверьте что используется `npm run build:production`
- Очистите кеш: Clear cache and deploy
- Удалите старый public/sitemap.xml из репозитория

### В sitemap только 36 URL
- Переменные окружения не установлены
- Build command неправильная
- Используется старый закешированный файл

## 📞 Поддержка

См. подробные инструкции в:
- `SITEMAP_QUICK_START.md` - быстрая справка
- `SITEMAP_PRODUCTION_GUIDE.md` - полный гид
- `SITEMAP_FIX_SUMMARY.md` - технические детали

## 📊 Ожидаемый результат

После правильной настройки:

```
============================================================
✅ SITEMAP GENERATED SUCCESSFULLY
============================================================
📊 Total URLs: 88

   Breakdown:
   • Static pages:    28
   • Categories:      4
   • Products:        4
   • Blog posts (RU): 27
   • Blog posts (EN): 25
   • Blog posts total: 52
============================================================
```

И Google Search Console покажет 88+ URL!
