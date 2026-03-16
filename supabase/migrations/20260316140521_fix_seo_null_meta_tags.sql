
/*
  # Fix NULL SEO meta tags for all locales

  ## Summary
  Many blog posts are missing seo_title and seo_description for cz/de/pl/uk locales,
  and several EN/RU posts also have stub/incomplete meta tags.
  This migration adds proper, optimized meta tags for all affected posts.

  ## Affected articles (NULL or missing)
  - best-led-strip-ceiling-complete-guide (cz/de/pl/uk)
  - how-long-do-led-strips-last (cz/de/pl/uk)
  - how-many-lumens-for-ceiling-lighting (cz/de/pl/uk)
  - how-to-connect-led-strip (cz/de/pl/uk)
  - led-strip-brightness-guide (cz/de/pl/uk)
  - led-strip-installation-mistakes (cz/de/pl/uk)
  - modern-ceiling-lighting-trends (cz/de/pl/uk)
  - smart-led-ceiling-lighting (cz/de/pl/uk)
  - warm-vs-cool-led-lighting (cz/de/pl/uk)
  - children-room-lighting-cri-color-rendering (en)
*/

-- ============================================================
-- best-led-strip-ceiling-complete-guide
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Nejlepší LED pásek pro stropní osvětlení: kompletní průvodce 2026',
  seo_description = 'Kompletní průvodce výběrem nejlepšího LED pásku pro strop. Porovnejte jas, CRI, teplotu chromatičnosti a metody montáže pro dokonalé výsledky.'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Bester LED-Streifen für Deckenbeleuchtung: vollständiger Ratgeber 2026',
  seo_description = 'Vollständiger Ratgeber zur Auswahl des besten LED-Streifens für die Decke. Vergleichen Sie Helligkeit, CRI, Farbtemperatur und Montagemethoden für perfekte Ergebnisse.'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Najlepsza taśma LED do oświetlenia sufitu: kompletny przewodnik 2026',
  seo_description = 'Kompletny przewodnik po wyborze najlepszej taśmy LED do sufitu. Porównaj jasność, CRI, temperaturę barwową i metody montażu dla doskonałych efektów.'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Найкраща LED стрічка для стелі: повний посібник покупця 2026',
  seo_description = 'Повний посібник з вибору найкращої LED стрічки для стелі. Порівняйте яскравість, CRI, кольорову температуру та методи монтажу для ідеального результату.'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'uk';

-- ============================================================
-- how-long-do-led-strips-last
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'How Long Do LED Strip Lights Last? Complete Lifespan Guide 2026',
  seo_description = 'Discover how long LED strip lights last and what factors affect lifespan. Learn maintenance tips to extend your LED strips to 50,000+ hours.'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Jak dlouho vydrží LED pásky? Průvodce životností 2026',
  seo_description = 'Zjistěte, jak dlouho LED pásky vydrží a co ovlivňuje jejich životnost. Tipy pro prodloužení výdrže LED pásků na 50 000+ hodin provozu.'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Wie lange halten LED-Streifen? Vollständiger Lebensdauer-Ratgeber 2026',
  seo_description = 'Erfahren Sie, wie lange LED-Streifen halten und welche Faktoren die Lebensdauer beeinflussen. Tipps zur Verlängerung Ihrer LED-Lebensdauer auf 50.000+ Stunden.'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Jak długo działają taśmy LED? Kompletny przewodnik po żywotności 2026',
  seo_description = 'Dowiedz się, jak długo działają taśmy LED i co wpływa na ich żywotność. Wskazówki jak przedłużyć działanie taśm LED do 50 000+ godzin.'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Скільки служить LED стрічка? Повний посібник з терміну служби 2026',
  seo_description = 'Дізнайтесь, скільки служать LED стрічки та що впливає на їх термін служби. Поради як продовжити роботу LED стрічки до 50 000+ годин.'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Срок службы LED ленты: полный справочник 2026',
  seo_description = 'Узнайте, сколько служит LED лента и что влияет на её долговечность. Советы по продлению срока службы LED лент до 50 000+ часов работы.'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'ru';

-- ============================================================
-- how-many-lumens-for-ceiling-lighting
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'How Many Lumens for Ceiling Lighting? Complete Calculator Guide 2026',
  seo_description = 'Calculate the perfect number of lumens for ceiling lighting in every room. Expert formulas, room-by-room recommendations, and LED brightness charts.'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Kolik lumenů pro stropní osvětlení? Kompletní průvodce 2026',
  seo_description = 'Vypočítejte správný počet lumenů pro stropní osvětlení každé místnosti. Odborné vzorce, doporučení pro každou místnost a tabulky jasu LED.'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Wie viele Lumen für Deckenbeleuchtung? Vollständiger Ratgeber 2026',
  seo_description = 'Berechnen Sie die perfekte Lumenzahl für die Deckenbeleuchtung in jedem Raum. Expertenformeln, raumspezifische Empfehlungen und LED-Helligkeitstabellen.'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Ile lumenów na oświetlenie sufitu? Kompletny poradnik 2026',
  seo_description = 'Oblicz optymalną liczbę lumenów do oświetlenia sufitu w każdym pomieszczeniu. Wzory ekspertów, zalecenia pokój po pokoju i tabele jasności LED.'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Скільки люменів для освітлення стелі? Повний посібник 2026',
  seo_description = 'Розрахуйте ідеальну кількість люменів для освітлення стелі у кожній кімнаті. Формули експертів, рекомендації по кімнатах та таблиці яскравості LED.'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Сколько люмен нужно для потолочного освещения? Полное руководство 2026',
  seo_description = 'Рассчитайте идеальное количество люмен для потолочного освещения в каждой комнате. Формулы экспертов, рекомендации по комнатам и таблицы яркости LED.'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'ru';

-- ============================================================
-- how-to-connect-led-strip
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'How to Connect LED Strip Lights: Complete Wiring Guide 2026',
  seo_description = 'Step-by-step guide to connecting LED strip lights correctly. Learn about connectors, soldering, power injection, and common wiring mistakes to avoid.'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Jak zapojit LED pásek: kompletní průvodce zapojením 2026',
  seo_description = 'Průvodce krok za krokem pro správné zapojení LED pásků. Naučte se o konektorech, pájení, vstřikování napájení a typických chybách zapojení.'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Streifen anschließen: vollständige Verkabelungsanleitung 2026',
  seo_description = 'Schritt-für-Schritt-Anleitung zum richtigen Anschluss von LED-Streifen. Lernen Sie über Steckverbinder, Löten, Spannungseinspeisung und häufige Verkabelungsfehler.'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Jak podłączyć taśmę LED: kompletny przewodnik okablowania 2026',
  seo_description = 'Poradnik krok po kroku jak prawidłowo podłączyć taśmy LED. Dowiedz się o złączkach, lutowaniu, iniekcji zasilania i typowych błędach okablowania.'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Як підключити LED стрічку: повний посібник з підключення 2026',
  seo_description = 'Покроковий посібник з правильного підключення LED стрічок. Дізнайтесь про конектори, пайку, інжекцію живлення та типові помилки підключення.'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Как подключить LED ленту: полное руководство по подключению 2026',
  seo_description = 'Пошаговое руководство по правильному подключению LED лент. Узнайте о разъёмах, пайке, инжекции питания и распространённых ошибках подключения.'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'ru';

-- ============================================================
-- led-strip-brightness-guide
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'LED Strip Brightness Guide: Lumens, Watts & Color Temperature 2026',
  seo_description = 'Complete guide to LED strip brightness. Learn how to choose the right lumens per meter, understand wattage, and select the perfect color temperature for every room.'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Průvodce jasem LED pásku: lumeny, watty a teplota chromatičnosti 2026',
  seo_description = 'Kompletní průvodce jasem LED pásku. Naučte se vybrat správné lumeny na metr, pochopit příkon a zvolit ideální teplotu chromatičnosti pro každou místnost.'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Streifen Helligkeitsratgeber: Lumen, Watt und Farbtemperatur 2026',
  seo_description = 'Vollständiger Ratgeber zur LED-Streifenhelligkeit. Lernen Sie, die richtigen Lumen pro Meter zu wählen, Wattleistung zu verstehen und die perfekte Farbtemperatur für jeden Raum.'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Przewodnik po jasności taśmy LED: lumeny, waty i temperatura barwowa 2026',
  seo_description = 'Kompletny przewodnik po jasności taśm LED. Jak wybrać właściwe lumeny na metr, zrozumieć moc i dobrać idealną temperaturę barwową do każdego pomieszczenia.'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Посібник з яскравості LED стрічки: люмени, вати та температура 2026',
  seo_description = 'Повний посібник з яскравості LED стрічки. Як вибрати правильні люмени на метр, зрозуміти потужність та підібрати ідеальну кольорову температуру для кожної кімнати.'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Руководство по яркости LED ленты: люмены, ватты и цветовая температура 2026',
  seo_description = 'Полное руководство по яркости LED лент. Как выбрать правильные люмены на метр, понять мощность и подобрать идеальную цветовую температуру для каждой комнаты.'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'ru';

-- ============================================================
-- led-strip-installation-mistakes
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'LED Strip Installation Mistakes: 15 Costly Errors to Avoid 2026',
  seo_description = 'Avoid the 15 most common LED strip installation mistakes. Expert guide covering power supply errors, voltage drop, poor adhesion, and wiring mistakes.'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Chyby při instalaci LED pásku: 15 drahých chyb, kterým se vyhnout',
  seo_description = 'Vyhněte se 15 nejčastějším chybám při instalaci LED pásků. Průvodce zahrnující chyby napájecího zdroje, úbytek napětí, slabé lepení a chyby zapojení.'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'LED-Montage-Fehler: 15 teure Fehler die Sie vermeiden sollten 2026',
  seo_description = 'Vermeiden Sie die 15 häufigsten LED-Montagefehler. Expertenratgeber zu Netzteilfehlern, Spannungsabfall, schlechter Haftung und Verkabelungsfehlern.'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Błędy montażu taśmy LED: 15 kosztownych błędów do uniknięcia 2026',
  seo_description = 'Unikaj 15 najczęstszych błędów przy montażu taśm LED. Przewodnik po błędach zasilacza, spadku napięcia, słabej przyczepności i błędach okablowania.'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Помилки монтажу LED стрічки: 15 дорогих помилок, яких варто уникати',
  seo_description = 'Уникайте 15 найпоширеніших помилок монтажу LED стрічок. Посібник з помилок блоку живлення, падіння напруги, поганого кріплення та помилок підключення.'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Ошибки монтажа LED ленты: 15 дорогостоящих ошибок, которых стоит избежать',
  seo_description = 'Избегайте 15 самых распространённых ошибок монтажа LED лент. Руководство по ошибкам блока питания, падению напряжения, плохому креплению и ошибкам подключения.'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'ru';

-- ============================================================
-- modern-ceiling-lighting-trends
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Modern Ceiling Lighting Trends 2026: Latest Ideas & Innovations',
  seo_description = 'Explore the latest modern ceiling lighting trends for 2026. Discover biophilic designs, smart lighting, minimalist aesthetics, and innovative LED solutions.'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Moderní trendy stropního osvětlení 2026: nejnovější nápady',
  seo_description = 'Prozkoumejte nejnovější trendy moderního stropního osvětlení pro rok 2026. Biofilie, chytré osvětlení, minimalistická estetika a inovativní LED řešení.'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Moderne Deckenbeleuchtungs-Trends 2026: neueste Ideen',
  seo_description = 'Entdecken Sie die neuesten modernen Deckenbeleuchtungs-Trends für 2026. Biophiles Design, Smart Lighting, minimalistische Ästhetik und innovative LED-Lösungen.'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Nowoczesne trendy oświetlenia sufitu 2026: najnowsze pomysły',
  seo_description = 'Poznaj najnowsze trendy nowoczesnego oświetlenia sufitu na 2026. Biofilny design, inteligentne oświetlenie, minimalistyczna estetyka i innowacyjne rozwiązania LED.'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Сучасні тренди освітлення стелі 2026: нові ідеї та інновації',
  seo_description = 'Досліджуйте останні тренди сучасного освітлення стелі на 2026 рік. Біофільний дизайн, розумне освітлення, мінімалістична естетика та інноваційні LED рішення.'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Современные тренды потолочного освещения 2026: новейшие идеи',
  seo_description = 'Исследуйте новейшие тренды современного потолочного освещения 2026. Биофильный дизайн, умное освещение, минималистичная эстетика и инновационные LED решения.'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'ru';

-- ============================================================
-- smart-led-ceiling-lighting
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Smart LED Ceiling Lighting: Complete Automation Guide 2026',
  seo_description = 'Transform your home with smart LED ceiling lighting. Learn about Alexa, Google Home, Zigbee, voice control, automations, and circadian rhythm lighting systems.'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Chytré LED stropní osvětlení: kompletní průvodce automatizací 2026',
  seo_description = 'Proměňte svůj domov chytrým LED stropním osvětlením. Průvodce Alexa, Google Home, Zigbee, hlasovým ovládáním, automatizacemi a cirkadiánním osvětlením.'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Intelligente LED-Deckenbeleuchtung: vollständiger Automatisierungsratgeber 2026',
  seo_description = 'Verwandeln Sie Ihr Zuhause mit intelligenter LED-Deckenbeleuchtung. Alexa, Google Home, Zigbee, Sprachsteuerung, Automatisierungen und circadianes Licht.'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Inteligentne LED oświetlenie sufitu: kompletny przewodnik 2026',
  seo_description = 'Przemień dom z inteligentnym LED oświetleniem sufitu. Przewodnik po Alexa, Google Home, Zigbee, sterowaniu głosem, automatyzacjach i oświetleniu dobowym.'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Розумне LED освітлення стелі: повний посібник з автоматизації 2026',
  seo_description = 'Перетворіть свій дім з розумним LED освітленням стелі. Alexa, Google Home, Zigbee, голосове керування, автоматизації та циркадне освітлення.'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Умное LED потолочное освещение: полное руководство по автоматизации 2026',
  seo_description = 'Преобразите дом с умным LED потолочным освещением. Alexa, Google Home, Zigbee, голосовое управление, автоматизации и циркадное освещение.'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'ru';

-- ============================================================
-- warm-vs-cool-led-lighting
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Warm vs Cool LED Lighting: Which Color Temperature is Right? 2026',
  seo_description = 'Learn when to use warm or cool LED lighting. Expert guide to color temperature (2700K-6500K) for every room: bedroom, living room, kitchen, and office.'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Teplé vs studené LED osvětlení: jaká teplota chromatičnosti je správná?',
  seo_description = 'Zjistěte, kdy použít teplé nebo studené LED osvětlení. Průvodce teplotou chromatičnosti (2700K–6500K) pro každou místnost: ložnici, obývací pokoj, kuchyni.'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Warmes vs kühles LED-Licht: welche Farbtemperatur ist richtig? 2026',
  seo_description = 'Lernen Sie, wann warmes oder kühles LED-Licht verwendet werden sollte. Ratgeber zur Farbtemperatur (2700K–6500K) für jeden Raum: Schlafzimmer, Wohnzimmer, Küche.'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Ciepłe vs chłodne LED: jaka temperatura barwowa jest właściwa? 2026',
  seo_description = 'Dowiedz się, kiedy używać ciepłego lub chłodnego oświetlenia LED. Przewodnik po temperaturze barwowej (2700K–6500K) dla każdego pomieszczenia.'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Тепле проти холодного LED: яка кольорова температура правильна? 2026',
  seo_description = 'Дізнайтесь, коли використовувати тепле або холодне LED освітлення. Посібник з кольорової температури (2700К–6500К) для кожної кімнати: спальні, вітальні, кухні.'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Тёплый vs холодный LED: какая цветовая температура правильная? 2026',
  seo_description = 'Узнайте, когда использовать тёплое или холодное LED освещение. Руководство по цветовой температуре (2700K–6500K) для каждой комнаты: спальни, гостиной, кухни.'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'ru';

-- ============================================================
-- children-room-lighting-cri-color-rendering (EN missing)
-- ============================================================
UPDATE blog_posts SET
  seo_title = 'Children Room Lighting: CRI & Color Rendering Guide for Safe Spaces',
  seo_description = 'How to choose safe LED lighting for children''s rooms. Why CRI index matters more than brightness. Comparison of RGB vs RGB+CCT technologies for kids.'
WHERE slug = 'children-room-lighting-cri-color-rendering' AND locale = 'en';
