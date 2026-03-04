# Sitemap Quick Fix - Production

## Проблема

На продакшене sitemap.xml содержит только 36 URL (без блог-постов). Локально работает правильно - 88 URL.

## Причина

На продакшене используется **старый sitemap.xml** который был загружен ДО исправлений, или:
- Не установлены переменные окружения
- Используется команда `npm run build` вместо `npm run build:production`

## ✅ Решение - 3 шага

### Шаг 1: Проверьте переменные окружения

В настройках хостинга (Netlify/Vercel/etc) должны быть установлены:

```bash
VITE_SUPABASE_URL=https://aahexteequomvfvlvkal.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...полный ключ...
```

### Шаг 2: Измените команду сборки

В настройках деплоя измените build command на:

```bash
npm run build:production
```

**НЕ используйте:** `npm run build` ❌

### Шаг 3: Удалите старый sitemap и передеплойте

```bash
# Локально:
git rm public/sitemap.xml
git add .
git commit -m "Remove old sitemap, will regenerate on deploy"
git push
```

## Проверка после деплоя

```bash
curl https://led-nabor.com/sitemap.xml | grep -c '<url>'
# Должно: 88
```

## Логи успешного билда

```
📰 Fetching blog posts from Supabase...
   ✓ Found 52 published blog posts
   ✓ Added 27 RU blog posts
   ✓ Added 25 EN blog posts
📊 Total URLs: 88
```
