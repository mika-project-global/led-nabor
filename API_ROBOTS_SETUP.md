# Настройка robots.txt для api.led-nabor.com

## Проблема
Backend API на домене `api.led-nabor.com` не должен индексироваться поисковыми системами.

## Решение

### Вариант 1: Если api.led-nabor.com - это отдельный Netlify site

1. Скопируйте файл `api-robots.txt` в корень API проекта как `robots.txt`
2. Разместите его в папке `public/` или в корне, чтобы он был доступен по URL: `https://api.led-nabor.com/robots.txt`

### Вариант 2: Если api.led-nabor.com - это Supabase Edge Functions

1. Создайте Edge Function для обработки `/robots.txt`:

```bash
# В папке supabase/functions создайте новую функцию
supabase functions new robots
```

2. Создайте файл `supabase/functions/robots/index.ts`:

```typescript
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const robotsTxt = `# Block all search engines from indexing API
User-agent: *
Disallow: /`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      ...corsHeaders,
    },
  });
});
```

3. Деплой функции:
```bash
supabase functions deploy robots --no-verify-jwt
```

4. Настройте reverse proxy на api.led-nabor.com для маршрута `/robots.txt`

### Вариант 3: Через headers в Netlify (если api - subdomain)

Добавьте в `netlify.toml`:

```toml
[[headers]]
for = "https://api.led-nabor.com/*"
[headers.values]
X-Robots-Tag = "noindex, nofollow, noarchive, nosnippet"
```

## X-Robots-Tag заголовок (Рекомендуется)

Самый надежный способ - добавить HTTP заголовок `X-Robots-Tag` на уровне сервера.

### Для Nginx:
```nginx
server {
    server_name api.led-nabor.com;

    location / {
        add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" always;
    }
}
```

### Для Apache (.htaccess):
```apache
Header set X-Robots-Tag "noindex, nofollow, noarchive, nosnippet"
```

### Для Cloudflare Workers:
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

## Проверка

После настройки проверьте:

1. Откройте `https://api.led-nabor.com/robots.txt` - должен вернуть содержимое файла
2. Проверьте заголовки:
   ```bash
   curl -I https://api.led-nabor.com
   ```
   Должен содержать: `X-Robots-Tag: noindex, nofollow`

3. Используйте Google Search Console для проверки индексации

## Примечание

- `robots.txt` - это рекомендация для ботов, они могут игнорировать её
- `X-Robots-Tag` - более надежный способ, так как это HTTP заголовок
- Рекомендуется использовать оба метода для максимальной защиты
- Если API уже проиндексирован Google, используйте Google Search Console для удаления URL из индекса
