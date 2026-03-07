# Настройка api.led-nabor.com для блокировки индексации

## Что сделано

1. Создан и задеплоен Edge Function `robots` для возврата robots.txt
2. Функция доступна по адресу: `https://aahexteequomvfvlvkal.supabase.co/functions/v1/robots`

## Настройка DNS и редиректов

### Вариант 1: api.led-nabor.com -> Cloudflare Worker (Рекомендуется)

Создайте Cloudflare Worker для api.led-nabor.com:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Обработка robots.txt
  if (url.pathname === '/robots.txt') {
    const robotsTxt = `# Block all search engines from indexing API
User-agent: *
Disallow: /`

    return new Response(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet'
      }
    })
  }

  // Все остальные запросы проксируются на Supabase
  const supabaseUrl = 'https://aahexteequomvfvlvkal.supabase.co' + url.pathname + url.search
  const response = await fetch(supabaseUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })

  // Добавляем X-Robots-Tag ко всем ответам
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  })
}
```

### Вариант 2: api.led-nabor.com -> Nginx Reverse Proxy

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name api.led-nabor.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Добавить X-Robots-Tag ко всем ответам
    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" always;

    # robots.txt
    location = /robots.txt {
        return 200 "User-agent: *\nDisallow: /\n";
        add_header Content-Type text/plain;
        add_header X-Robots-Tag "noindex, nofollow" always;
    }

    # Прокси на Supabase
    location / {
        proxy_pass https://aahexteequomvfvlvkal.supabase.co;
        proxy_set_header Host aahexteequomvfvlvkal.supabase.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Вариант 3: Использовать задеплоенную Edge Function

Настройте DNS CNAME для api.led-nabor.com на ваш Supabase проект и настройте custom domain в Supabase.

Затем настройте URL Rewrite для `/robots.txt`:
- `/robots.txt` → `/functions/v1/robots`

## Проверка после настройки

1. **Проверьте robots.txt:**
   ```bash
   curl https://api.led-nabor.com/robots.txt
   ```
   Должен вернуть:
   ```
   User-agent: *
   Disallow: /
   ```

2. **Проверьте заголовки:**
   ```bash
   curl -I https://api.led-nabor.com
   ```
   Должен содержать:
   ```
   X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
   ```

3. **Google Search Console:**
   - Используйте инструмент "URL Inspection"
   - Проверьте, что URL помечен как "noindex"

## Удаление уже проиндексированных страниц

Если api.led-nabor.com уже проиндексирован:

1. Откройте Google Search Console
2. Перейдите в "Removals" → "New Request"
3. Введите: `https://api.led-nabor.com/`
4. Выберите "Remove all URLs with this prefix"
5. Отправьте запрос

## Дополнительная безопасность

Добавьте в `.htaccess` или конфигурацию сервера:

```apache
# Блокировка User-Agents поисковых ботов
RewriteEngine On
RewriteCond %{HTTP_USER_AGENT} (googlebot|bingbot|yahoo|baiduspider|yandex|msnbot|duckduckbot) [NC]
RewriteRule .* - [F,L]
```

## Текущий статус

- ✅ Edge Function `robots` создана и задеплоена
- ⏳ Требуется настройка DNS и reverse proxy для api.led-nabor.com
- ⏳ Требуется настройка X-Robots-Tag заголовков
