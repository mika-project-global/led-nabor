#!/bin/bash

# Скрипт для проверки robots meta-тега на разных языковых версиях

echo "🔍 Проверка robots meta-тега для разных языков"
echo ""

# URL сайта (можно изменить на production URL)
BASE_URL="${1:-http://localhost:5173}"

# Функция для проверки meta-тега
check_robots_meta() {
    local lang=$1
    local url="${BASE_URL}/${lang}/"

    echo "📄 Проверка: ${url}"

    # Делаем запрос и ищем robots meta-тег
    if command -v curl &> /dev/null; then
        robots_tag=$(curl -s "${url}" | grep -o '<meta name="robots" content="[^"]*"')

        if [ -n "$robots_tag" ]; then
            echo "   ✅ Найден: ${robots_tag}"
        else
            echo "   ❌ Robots meta-тег не найден"
        fi
    else
        echo "   ⚠️  curl не установлен, пропускаем проверку"
    fi
    echo ""
}

echo "Неиспользуемые языки (должны иметь noindex):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_robots_meta "pl"
check_robots_meta "cz"
check_robots_meta "de"

echo ""
echo "Активные языки (должны иметь index):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_robots_meta "ru"
check_robots_meta "en"

echo ""
echo "✨ Проверка завершена!"
echo ""
echo "Ожидаемые результаты:"
echo "  • pl, cz, de: content=\"noindex, follow\""
echo "  • ru, en: content=\"index, follow\""
