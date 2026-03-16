
/*
  # Fix too-short SEO titles and descriptions

  ## Summary
  Many posts have stub seo_title (under 40 chars) and seo_description (under 100 chars).
  This migration replaces them with properly optimized meta tags.

  ## Target length
  - seo_title: 50-65 characters
  - seo_description: 130-165 characters

  ## Affected posts
  - what-power-supply-for-led-strip (all locales)
  - how-to-hide-led-strip-on-ceiling (en/ru)
  - led-lighting-for-kitchen-ceiling (all locales)
  - led-lighting-for-living-room-ceiling (cz/de/pl)
  - led-lighting-for-bedroom-ceiling (all locales)
  - led-ceiling-lighting-ideas (all locales)
  - how-to-install-led-strip-on-ceiling (ru)
  - best-led-strip-for-ceiling-lighting (ru)
  - led-ceiling-lighting-guide (en/ru)
  - rgb-led-ceiling-lighting-ideas (en/ru)
*/

-- ============================================================
-- what-power-supply-for-led-strip (all stubs)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'What Power Supply for LED Strip Lights? Selection Guide 2026',
  seo_description = 'Learn how to choose the right power supply for LED strip lights. Covers voltage (12V vs 24V), wattage calculation, safety margins, and top brands like Mean Well.'
WHERE slug = 'what-power-supply-for-led-strip' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Jaký napájecí zdroj pro LED pásek? Průvodce výběrem 2026',
  seo_description = 'Zjistěte, jak vybrat správný napájecí zdroj pro LED pásky. Napětí (12V vs 24V), výpočet výkonu, bezpečnostní rezervy a doporučené značky jako Mean Well.'
WHERE slug = 'what-power-supply-for-led-strip' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Welches Netzteil für LED-Streifen? Auswahlratgeber 2026',
  seo_description = 'Erfahren Sie, wie Sie das richtige Netzteil für LED-Streifen wählen. Spannung (12V vs 24V), Leistungsberechnung, Sicherheitspuffer und empfohlene Marken wie Mean Well.'
WHERE slug = 'what-power-supply-for-led-strip' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Jaki zasilacz do taśmy LED? Przewodnik po wyborze 2026',
  seo_description = 'Dowiedz się, jak wybrać właściwy zasilacz do taśm LED. Napięcie (12V vs 24V), obliczenie mocy, marginesy bezpieczeństwa i polecane marki jak Mean Well.'
WHERE slug = 'what-power-supply-for-led-strip' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Який блок живлення для LED стрічки? Посібник з вибору 2026',
  seo_description = 'Дізнайтесь, як вибрати правильний блок живлення для LED стрічок. Напруга (12В vs 24В), розрахунок потужності, запас безпеки та рекомендовані бренди Mean Well.'
WHERE slug = 'what-power-supply-for-led-strip' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Какой блок питания для LED ленты? Руководство по выбору 2026',
  seo_description = 'Узнайте, как выбрать правильный блок питания для LED лент. Напряжение (12В vs 24В), расчёт мощности, запасы безопасности и рекомендуемые бренды Mean Well.'
WHERE slug = 'what-power-supply-for-led-strip' AND locale = 'ru';

-- ============================================================
-- how-to-hide-led-strip-on-ceiling
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'How to Hide LED Strip Lights on Ceiling: Professional Guide 2026',
  seo_description = 'Learn professional methods to hide LED strip lights on your ceiling. Aluminum profiles, cove lighting, built-in niches, and moldings for a clean, polished look.'
WHERE slug = 'how-to-hide-led-strip-on-ceiling' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Как скрыть LED ленту на потолке: профессиональный гид 2026',
  seo_description = 'Профессиональные методы скрытого монтажа LED ленты на потолке. Алюминиевые профили, ниши, карнизы и другие техники для идеального результата.'
WHERE slug = 'how-to-hide-led-strip-on-ceiling' AND locale = 'ru';

-- ============================================================
-- led-lighting-for-kitchen-ceiling (all stubs)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Kitchen Ceiling LED Lighting: Complete Design & Installation Guide',
  seo_description = 'Transform your kitchen with the right ceiling LED lighting. Expert guide on color temperature, brightness levels, under-cabinet lighting, and island illumination.'
WHERE slug = 'led-lighting-for-kitchen-ceiling' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'LED osvětlení stropní kuchyně: kompletní průvodce designem 2026',
  seo_description = 'Proměňte kuchyni správným stropním LED osvětlením. Průvodce teplotou chromatičnosti, úrovněmi jasu, podsvícením skříněk a osvětlením kuchyňského ostrova.'
WHERE slug = 'led-lighting-for-kitchen-ceiling' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Küchendeckenbeleuchtung: vollständiger Design-Ratgeber 2026',
  seo_description = 'Verwandeln Sie Ihre Küche mit der richtigen LED-Deckenbeleuchtung. Ratgeber zu Farbtemperatur, Helligkeitsniveaus, Unterbaubeleuchtung und Inselbeleuchtung.'
WHERE slug = 'led-lighting-for-kitchen-ceiling' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'LED oświetlenie sufitu kuchennego: kompletny poradnik 2026',
  seo_description = 'Odmień kuchnię odpowiednim oświetleniem sufitu LED. Przewodnik po temperaturze barwowej, poziomach jasności, podświetleniu szafek i oświetleniu wyspy.'
WHERE slug = 'led-lighting-for-kitchen-ceiling' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'LED підсвітка стелі кухні: повний посібник з дизайну 2026',
  seo_description = 'Перетворіть кухню з правильним LED освітленням стелі. Посібник з кольорової температури, рівнів яскравості, підсвічування шафок та освітлення острова.'
WHERE slug = 'led-lighting-for-kitchen-ceiling' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'LED освещение потолка кухни: полное руководство по дизайну 2026',
  seo_description = 'Преобразите кухню правильным LED освещением потолка. Руководство по цветовой температуре, уровням яркости, подсветке шкафов и освещению острова.'
WHERE slug = 'led-lighting-for-kitchen-ceiling' AND locale = 'ru';

-- ============================================================
-- led-lighting-for-living-room-ceiling (short descriptions)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'LED osvětlení stropu v obývacím pokoji: průvodce designem 2026',
  seo_description = 'Proměňte obývací pokoj dokonalým LED stropním osvětlením. Tipy na výběr teploty chromatičnosti, víceúrovňové osvětlení, stmívání a chytré ovládání.'
WHERE slug = 'led-lighting-for-living-room-ceiling' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Beleuchtung Wohnzimmerdecke: Design-Ratgeber 2026',
  seo_description = 'Verwandeln Sie Ihr Wohnzimmer mit perfekter LED-Deckenbeleuchtung. Tipps zur Farbtemperatur, mehrstufiger Beleuchtung, Dimmen und Smart-Home-Steuerung.'
WHERE slug = 'led-lighting-for-living-room-ceiling' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'LED oświetlenie sufitu w salonie: przewodnik projektowy 2026',
  seo_description = 'Przekształć salon idealnym LED oświetleniem sufitu. Porady dotyczące temperatury barwowej, wielopoziomowego oświetlenia, ściemniania i inteligentnego sterowania.'
WHERE slug = 'led-lighting-for-living-room-ceiling' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'LED освітлення стелі у вітальні: гід з дизайну 2026',
  seo_description = 'Перетворіть вітальню ідеальним LED освітленням стелі. Поради щодо кольорової температури, багаторівневого освітлення, диммінгу та розумного керування.'
WHERE slug = 'led-lighting-for-living-room-ceiling' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'LED освещение потолка гостиной: дизайн-руководство 2026',
  seo_description = 'Преобразите гостиную идеальным LED освещением потолка. Советы по цветовой температуре, многоуровневому освещению, диммированию и умному управлению.'
WHERE slug = 'led-lighting-for-living-room-ceiling' AND locale = 'ru';

UPDATE blog_posts SET
  seo_title = 'Living Room Ceiling LED Lighting: Design Guide 2026',
  seo_description = 'Transform your living room with perfect LED ceiling lighting. Expert tips on color temperature, layered lighting, dimming options, and smart home integration.'
WHERE slug = 'led-lighting-for-living-room-ceiling' AND locale = 'en';

-- ============================================================
-- led-lighting-for-bedroom-ceiling (short descriptions)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Bedroom Ceiling LED Lighting: Complete Ambiance Guide 2026',
  seo_description = 'Create the perfect bedroom ambiance with LED ceiling lighting. Expert advice on warm vs cool temperature, dimming for sleep, circadian rhythm, and smart controls.'
WHERE slug = 'led-lighting-for-bedroom-ceiling' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'LED osvětlení stropu ložnice: kompletní průvodce atmosférou 2026',
  seo_description = 'Vytvořte dokonalou atmosféru ložnice s LED stropním osvětlením. Teplá vs studená teplota chromatičnosti, stmívání pro spánek a chytré ovládání.'
WHERE slug = 'led-lighting-for-bedroom-ceiling' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Beleuchtung Schlafzimmerdecke: vollständiger Atmosphäre-Guide 2026',
  seo_description = 'Schaffen Sie die perfekte Schlafzimmeratmosphäre mit LED-Deckenbeleuchtung. Warme vs kühle Farbtemperatur, Dimmen für besseren Schlaf und Smart-Steuerung.'
WHERE slug = 'led-lighting-for-bedroom-ceiling' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'LED oświetlenie sufitu sypialni: kompletny przewodnik atmosfery 2026',
  seo_description = 'Stwórz idealną atmosferę sypialni z LED oświetleniem sufitu. Ciepła vs chłodna temperatura barwowa, ściemnianie do snu i inteligentne sterowanie.'
WHERE slug = 'led-lighting-for-bedroom-ceiling' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'LED освітлення стелі спальні: повний посібник з атмосфери 2026',
  seo_description = 'Створіть ідеальну атмосферу спальні з LED освітленням стелі. Тепла vs холодна кольорова температура, диммінг для сну та розумне керування.'
WHERE slug = 'led-lighting-for-bedroom-ceiling' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'LED освещение потолка спальни: полный гид по атмосфере 2026',
  seo_description = 'Создайте идеальную атмосферу спальни с LED освещением потолка. Тёплая vs холодная цветовая температура, диммирование для сна и умное управление.'
WHERE slug = 'led-lighting-for-bedroom-ceiling' AND locale = 'ru';

-- ============================================================
-- led-ceiling-lighting-ideas (short descriptions)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'LED Ceiling Lighting Ideas: 50+ Inspiring Designs for Every Room',
  seo_description = 'Explore 50+ creative LED ceiling lighting ideas for every room. Modern designs, cove lighting, geometric patterns, and professional inspiration for your next project.'
WHERE slug = 'led-ceiling-lighting-ideas' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Nápady na LED stropní osvětlení: 50+ inspirativních designů 2026',
  seo_description = 'Prozkoumejte 50+ kreativních nápadů na LED stropní osvětlení pro každou místnost. Moderní designs, niky, geometrické vzory a odborná inspirace pro váš projekt.'
WHERE slug = 'led-ceiling-lighting-ideas' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Deckenbeleuchtungsideen: 50+ inspirierende Designs für jeden Raum',
  seo_description = 'Entdecken Sie 50+ kreative LED-Deckenbeleuchtungsideen für jeden Raum. Moderne Designs, Nischenbeleuchtung, geometrische Muster und professionelle Inspiration.'
WHERE slug = 'led-ceiling-lighting-ideas' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Pomysły na LED oświetlenie sufitu: 50+ inspirujących projektów 2026',
  seo_description = 'Odkryj 50+ kreatywnych pomysłów na oświetlenie sufitu LED dla każdego pomieszczenia. Nowoczesne projekty, oświetlenie wnękowe, wzory geometryczne i inspiracje.'
WHERE slug = 'led-ceiling-lighting-ideas' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Ідеї LED освітлення стелі: 50+ надихаючих дизайнів для кожної кімнати',
  seo_description = 'Досліджуйте 50+ творчих ідей LED освітлення стелі для кожної кімнати. Сучасні дизайни, нішове підсвічування, геометричні патерни та натхнення для вашого проєкту.'
WHERE slug = 'led-ceiling-lighting-ideas' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Идеи LED подсветки потолка: 50+ вдохновляющих дизайнов для каждой комнаты',
  seo_description = 'Исследуйте 50+ креативных идей LED подсветки потолка для каждой комнаты. Современные дизайны, нишевое освещение, геометрические узоры и профессиональное вдохновение.'
WHERE slug = 'led-ceiling-lighting-ideas' AND locale = 'ru';

-- ============================================================
-- led-ceiling-lighting-guide (en/ru stubs)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'LED Ceiling Lighting Guide: Complete Reference for Modern Homes 2026',
  seo_description = 'Ultimate guide to LED ceiling lighting. Learn about types, brightness calculation, color temperature, mounting methods, and smart home integration for beautiful results.'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Полное руководство по LED потолочному освещению для современных домов',
  seo_description = 'Подробный справочник по LED освещению потолка: выбор типа, расчёт мощности, монтаж, умное управление и советы по обслуживанию для современного дома.'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'ru';

-- ============================================================
-- rgb-led-ceiling-lighting-ideas (en/ru stubs)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'RGB LED Ceiling Lighting Ideas: 25+ Creative Designs for Your Home',
  seo_description = 'Discover 25+ creative RGB LED ceiling lighting ideas. Cinema effects, spa ambiance, party modes, smart synchronization, and dynamic color effects for every room.'
WHERE slug = 'rgb-led-ceiling-lighting-ideas' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Идеи RGB LED подсветки потолка: 25+ творческих идей для дома 2026',
  seo_description = '25+ творческих идей RGB LED освещения потолка: эффект кинотеатра, атмосфера спа, режим вечеринки, синхронизация с музыкой и динамические цветовые эффекты.'
WHERE slug = 'rgb-led-ceiling-lighting-ideas' AND locale = 'ru';

-- ============================================================
-- how-to-install-led-strip-on-ceiling (ru stub)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Как установить LED ленту на потолок: пошаговое руководство 2026',
  seo_description = 'Полное пошаговое руководство по установке LED ленты на потолок. Инструменты, алюминиевые профили, подключение, инжекция питания и устранение типичных ошибок.'
WHERE slug = 'how-to-install-led-strip-on-ceiling' AND locale = 'ru';

-- ============================================================
-- best-led-strip-for-ceiling-lighting (ru stub)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Лучшая LED лента для потолочного освещения: выбор и обзор 2026',
  seo_description = 'Обзор лучших LED лент для потолка: COB vs SMD, яркость, CRI, цветовая температура. Выберите идеальную LED ленту для вашего проекта освещения.'
WHERE slug = 'best-led-strip-for-ceiling-lighting' AND locale = 'ru';
