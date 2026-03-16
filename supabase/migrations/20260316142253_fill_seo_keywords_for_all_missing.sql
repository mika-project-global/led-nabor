
/*
  # Fill SEO Keywords for 14 blog slugs across all locales

  Updates seo_keywords for all blog posts where it is NULL.
  Covers 14 slugs x up to 5 locales (en, uk, pl, de, cz).
*/

-- best-led-strip-ceiling-complete-guide
UPDATE blog_posts SET seo_keywords = 'best LED strip ceiling, LED strip buyer guide, LED strip lighting 2024, ceiling LED strip, LED tape ceiling'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'найкраща LED стрічка стеля, LED стрічка купити, підсвітка стелі LED, LED стрічка 2024'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'najlepsza taśma LED sufit, LED taśma kupić, oświetlenie sufitowe LED, taśma LED 2024'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'bester LED-Streifen Decke, LED-Streifen kaufen, Deckenbeleuchtung LED, LED Band 2024'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'nejlepší LED pásek strop, LED pásek koupit, stropní osvětlení LED, LED páska 2024'
WHERE slug = 'best-led-strip-ceiling-complete-guide' AND locale = 'cz';

-- best-led-strip-for-apartment-lighting
UPDATE blog_posts SET seo_keywords = 'LED strip apartment lighting, LED tape for flat, apartment ceiling LED, best LED strip home'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'LED стрічка квартира, підсвітка квартири LED, LED стрічка для дому, стельова підсвітка'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'taśma LED mieszkanie, oświetlenie mieszkania LED, najlepsza taśma LED dom, podświetlenie sufitu'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED-Streifen Wohnung, LED Band Apartment, Wohnungsbeleuchtung LED, LED Decke Wohnung'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'LED pásek byt, osvětlení bytu LED, nejlepší LED páska dům, stropní podsvícení'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'cz';

-- can-led-strip-replace-chandelier
UPDATE blog_posts SET seo_keywords = 'LED strip instead of chandelier, replace chandelier LED, ceiling lighting without chandelier, LED strip main light'
WHERE slug = 'can-led-strip-replace-chandelier' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'LED стрічка замість люстри, підсвітка без люстри, стельове освітлення LED, замінити люстру LED'
WHERE slug = 'can-led-strip-replace-chandelier' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'taśma LED zamiast żyrandola, oświetlenie bez żyrandola, LED zamiast lampy sufitowej, zastąpić żyrandol LED'
WHERE slug = 'can-led-strip-replace-chandelier' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED-Streifen statt Kronleuchter, Deckenbeleuchtung ohne Kronleuchter, LED statt Lampe, Kronleuchter ersetzen LED'
WHERE slug = 'can-led-strip-replace-chandelier' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'LED pásek místo lustru, osvětlení bez lustru, stropní osvětlení LED, nahradit lustr LED'
WHERE slug = 'can-led-strip-replace-chandelier' AND locale = 'cz';

-- children-room-lighting-cri-color-rendering
UPDATE blog_posts SET seo_keywords = 'children room lighting CRI, color rendering LED, kids room LED light, CRI 90 LED strip, safe lighting children'
WHERE slug = 'children-room-lighting-cri-color-rendering' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'освітлення дитячої кімнати, LED дитяча CRI, колірна температура дитяча, CRI 90 LED'
WHERE slug = 'children-room-lighting-cri-color-rendering' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'oświetlenie pokoju dziecięcego CRI, LED pokój dziecięcy, temperatura barwowa dzieci, CRI 90 LED'
WHERE slug = 'children-room-lighting-cri-color-rendering' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'Kinderzimmer Beleuchtung CRI, LED Kinderzimmer, Farbwiedergabe LED, CRI 90 LED-Streifen'
WHERE slug = 'children-room-lighting-cri-color-rendering' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'osvětlení dětského pokoje CRI, LED dětský pokoj, podání barev LED, CRI 90 LED páska'
WHERE slug = 'children-room-lighting-cri-color-rendering' AND locale = 'cz';

-- how-long-do-led-strips-last
UPDATE blog_posts SET seo_keywords = 'how long LED strips last, LED strip lifespan, LED tape durability, LED strip hours, LED lifetime'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'скільки служить LED стрічка, термін служби LED, LED стрічка надійність, скільки годин LED'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'jak długo działa taśma LED, żywotność LED, trwałość taśmy LED, ile godzin LED'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'wie lange LED-Streifen halten, LED-Lebensdauer, LED Band Haltbarkeit, LED Stunden'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'jak dlouho vydrží LED páska, životnost LED, trvanlivost LED pásky, počet hodin LED'
WHERE slug = 'how-long-do-led-strips-last' AND locale = 'cz';

-- how-many-lumens-for-ceiling-lighting
UPDATE blog_posts SET seo_keywords = 'how many lumens ceiling light, lumens per square meter, LED ceiling brightness, lux lighting calculation'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'скільки люмен для стелі, люмен на метр квадратний, яскравість LED стелі, розрахунок освітлення'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'ile lumenów do oświetlenia sufitu, lumeny na metr kwadratowy, jasność LED sufit, obliczenie oświetlenia'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'wie viele Lumen Deckenbeleuchtung, Lumen pro Quadratmeter, LED Decke Helligkeit, Beleuchtungsberechnung'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'kolik lumenů stropní osvětlení, lumeny na metr čtvereční, jas LED strop, výpočet osvětlení'
WHERE slug = 'how-many-lumens-for-ceiling-lighting' AND locale = 'cz';

-- how-to-connect-led-strip
UPDATE blog_posts SET seo_keywords = 'how to connect LED strip, LED strip wiring, connect LED tape, LED strip connector, LED strip power supply'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'як підключити LED стрічку, підключення LED стрічки, з єднання LED, блок живлення LED'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'jak podłączyć taśmę LED, podłączenie LED, złącze taśmy LED, zasilacz LED'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED-Streifen anschließen, LED Band verbinden, LED Streifen Anschluss, LED Netzteil'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'jak zapojit LED pásku, připojení LED pásky, konektor LED pásky, napájecí zdroj LED'
WHERE slug = 'how-to-connect-led-strip' AND locale = 'cz';

-- how-to-install-led-strip-ceiling-complete
UPDATE blog_posts SET seo_keywords = 'how to install LED strip ceiling, LED ceiling installation guide, mount LED strip ceiling, LED strip step by step'
WHERE slug = 'how-to-install-led-strip-ceiling-complete' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'монтаж LED стрічки стеля, встановлення LED стрічки, як монтувати LED стрічку'
WHERE slug = 'how-to-install-led-strip-ceiling-complete' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'montaż taśmy LED sufit, instalacja LED sufit, jak zainstalować taśmę LED'
WHERE slug = 'how-to-install-led-strip-ceiling-complete' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED-Streifen Decke montieren, LED Installation Decke, LED Streifen anbringen Anleitung'
WHERE slug = 'how-to-install-led-strip-ceiling-complete' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'montáž LED pásky strop, instalace LED strop, jak nainstalovat LED pásku'
WHERE slug = 'how-to-install-led-strip-ceiling-complete' AND locale = 'cz';

-- led-ceiling-lighting-guide
UPDATE blog_posts SET seo_keywords = 'LED ceiling lighting guide, ceiling LED light tips, LED ceiling installation, best LED ceiling light'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'LED стельове освітлення гід, LED стеля поради, монтаж LED стелі, найкраще LED стельове освітлення'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'oświetlenie sufitowe LED poradnik, LED sufit porady, montaż LED sufit, najlepsze LED sufitowe'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED Deckenbeleuchtung Ratgeber, LED Decke Tipps, LED Decke montieren, beste LED Deckenleuchte'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'LED stropní osvětlení průvodce, LED strop tipy, montáž LED stropu, nejlepší LED stropní osvětlení'
WHERE slug = 'led-ceiling-lighting-guide' AND locale = 'cz';

-- led-strip-brightness-guide
UPDATE blog_posts SET seo_keywords = 'LED strip brightness guide, how bright LED strip, LED tape lumens, LED strip watt brightness'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'яскравість LED стрічки, скільки люмен LED стрічка, потужність LED підсвітки, LED стрічка вати'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'jasność taśmy LED, ile lumenów taśma LED, moc LED, taśma LED waty jasność'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED-Streifen Helligkeit, wie hell LED-Band, LED Tape Lumen, LED Streifen Watt Helligkeit'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'jas LED pásky, kolik lumenů LED páska, výkon LED, LED páska watty jas'
WHERE slug = 'led-strip-brightness-guide' AND locale = 'cz';

-- led-strip-installation-mistakes
UPDATE blog_posts SET seo_keywords = 'LED strip installation mistakes, LED tape errors, common LED mistakes, LED strip problems, avoid LED errors'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'помилки монтажу LED стрічки, помилки LED підсвітки, типові помилки LED, проблеми LED стрічки'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'błędy montażu taśmy LED, błędy LED, typowe błędy taśma LED, problemy taśma LED'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'LED-Streifen Fehler, Montagefehler LED, typische LED Fehler, LED Band Probleme'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'chyby montáže LED pásky, chyby LED, typické chyby LED páska, problémy LED páska'
WHERE slug = 'led-strip-installation-mistakes' AND locale = 'cz';

-- modern-ceiling-lighting-trends
UPDATE blog_posts SET seo_keywords = 'modern ceiling lighting trends, LED ceiling 2024 trends, interior lighting trends, ceiling light design'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'тренди стельового освітлення, LED стеля 2024 тренди, дизайн освітлення інтер єру'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'trendy oświetlenia sufitowego, LED sufit 2024 trendy, design oświetlenia wnętrz'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'moderne Deckenbeleuchtung Trends, LED Decke 2024 Trends, Innenbeleuchtung Trends, Deckenlampe Design'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'moderní trendy stropního osvětlení, LED strop 2024 trendy, design osvětlení interiéru'
WHERE slug = 'modern-ceiling-lighting-trends' AND locale = 'cz';

-- smart-led-ceiling-lighting
UPDATE blog_posts SET seo_keywords = 'smart LED ceiling lighting, smart home LED, LED strip app control, WiFi LED ceiling, voice control LED'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'розумне LED стельове освітлення, смарт LED стеля, LED стрічка керування додатком, WiFi LED'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'inteligentne oświetlenie sufitowe LED, smart home LED, taśma LED sterowanie aplikacją, WiFi LED'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'Smart LED Deckenbeleuchtung, Smart Home LED, LED-Streifen App-Steuerung, WiFi LED Decke'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'chytré LED stropní osvětlení, smart home LED, LED páska ovládání aplikací, WiFi LED strop'
WHERE slug = 'smart-led-ceiling-lighting' AND locale = 'cz';

-- warm-vs-cool-led-lighting
UPDATE blog_posts SET seo_keywords = 'warm vs cool LED lighting, LED color temperature, 2700K vs 6500K LED, warm white LED, cool white LED'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'en';

UPDATE blog_posts SET seo_keywords = 'тепле vs холодне LED освітлення, температура кольору LED, 2700K 6500K LED, тепле біле LED'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'uk';

UPDATE blog_posts SET seo_keywords = 'ciepłe vs zimne LED, temperatura barwowa LED, 2700K 6500K LED, ciepłe białe LED'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'pl';

UPDATE blog_posts SET seo_keywords = 'warmweißes vs kaltweißes LED, LED Farbtemperatur, 2700K vs 6500K LED, warmes weißes LED'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'de';

UPDATE blog_posts SET seo_keywords = 'teplé vs studené LED osvětlení, teplota barvy LED, 2700K 6500K LED, teplá bílá LED'
WHERE slug = 'warm-vs-cool-led-lighting' AND locale = 'cz';
